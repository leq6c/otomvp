import asyncio
from fastapi import APIRouter, UploadFile, Depends, HTTPException
from sqlmodel import select, Session
from oto.infra.storage import get_storage
from oto.infra.database import get_db_session
from oto.domain.conversation import Conversation
from oto.routers.deps.auth import require_user_id, require_conversation
from prefect.deployments import run_deployment
from oto.services.safety import check_conversation_limit_exceeded

router = APIRouter(prefix="/conversation")


@router.post("/create")
async def create_conversation(
    file: UploadFile,
    user_id: str = Depends(require_user_id),
    session: Session = Depends(get_db_session),
):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File is not an audio file")

    # 300MB
    if file.size > 300 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File is too large (max 300MB)")

    try:
        check_conversation_limit_exceeded()
    except Exception as _:
        raise HTTPException(status_code=503, detail="Our server reached its limit")

    storage = get_storage()
    filepath = storage.upload_file(file, f"uploads/{user_id}")

    conversation = Conversation(
        user_id=user_id,
        file_name=file.filename,
        file_path=filepath,
        mime_type=file.content_type,
    )
    session.add(conversation)
    session.flush()
    session.refresh(conversation)
    session.commit()

    flow_run = await run_deployment(
        name="process_conversation/process_conversation",
        parameters={"conversation_id": conversation.id},
        timeout=0,
    )

    return {
        "id": conversation.id,
        "status": conversation.status.value,
        "flow_run_id": flow_run.id,
    }


@router.get("/list")
async def list_conversations(
    user_id: str = Depends(require_user_id),
    session: Session = Depends(get_db_session),
):
    conversations = session.exec(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.created_at.desc())
        .limit(30)
    ).all()
    return conversations


@router.get("/{conversation_id}")
async def get_conversation(
    conversation: Conversation = Depends(require_conversation),
):
    return conversation

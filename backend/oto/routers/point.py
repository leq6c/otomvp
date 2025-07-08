from fastapi import APIRouter, Depends
from sqlmodel import select, Session
from oto.infra.database import get_db_session
from oto.domain.point import Point, PointTransaction
from oto.routers.deps.auth import require_user_id

router = APIRouter(prefix="/point")


@router.get("/get")
async def get_point(
    user_id: str = Depends(require_user_id),
    session: Session = Depends(get_db_session),
):
    point = session.exec(select(Point).where(Point.user_id == user_id)).first()

    return point


@router.get("/transaction/list")
async def get_point_transaction(
    user_id: str = Depends(require_user_id),
    session: Session = Depends(get_db_session),
):
    point_transaction = session.exec(
        select(PointTransaction)
        .where(PointTransaction.user_id == user_id)
        .order_by(PointTransaction.created_at.desc())
    ).all()
    return point_transaction

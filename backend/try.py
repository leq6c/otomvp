from oto.tasks.content.create_clip import create_clip_flow
from oto.services.content.text_to_speech import get_text_to_speech_service

text_to_speech_service = get_text_to_speech_service()

audio = text_to_speech_service.generate(
    "彼は「最高っす」と笑っていましたが、その数秒後、とんでもない実力を明かしたのです。"
)

with open("audio.opus", "wb") as f:
    f.write(audio)
exit()

create_clip_flow()

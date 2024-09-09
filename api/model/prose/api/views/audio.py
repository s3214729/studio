from ninja import Router, UploadedFile, File, Form
from prose.api.schemas.audio import TextSchema, SpeechSchema
from whisper import load_model
from tempfile import NamedTemporaryFile
from fastapi import HTTPException
from gtts import gTTS
from io import BytesIO
from django.http import HttpRequest
import re

audio = Router()
model = load_model("base")

@audio.post('/stt', response=TextSchema)
def speech_to_text(request: HttpRequest, input_audio: File[UploadedFile]):
    try:

        print(f"Received file: {input_audio.name}, size: {input_audio.size}, type: {input_audio.content_type}")

        with NamedTemporaryFile(delete=True) as temp:
            temp.write(input_audio.read())
            temp.flush()

            result = model.transcribe(temp.name)

            transcription = result.get("text", "")

            return TextSchema(text=transcription)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@audio.post('/tts', response=SpeechSchema)
def text_to_speech(request, input_text: str = Form(...)):
    # Find questions (Qx format) in the text
    questions = re.findall(r'Q\d+[\.]?\s.*', input_text)

    if questions:
        questions_text = ' '.join(questions)

        try:
            tts = gTTS(questions_text, lang='en')
            audio = BytesIO()
            tts.write_to_fp(audio)
            audio.seek(0)
            filename = "tts_output.wav"

            # Save the audio file to a specified directory

            metadata = SpeechSchema(
                filename="tts_output.wav",
                content_type="audio/mpeg",
                input=questions_text,
                file_url=f"/tts/audio/{filename}"
            )
            return metadata

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(status_code=400, detail="No questions found in the text.")

__all__ = ["audio"]

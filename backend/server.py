from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import whisper
import os
os.environ["PATH"] += os.pathsep + r"C:\Users\edw50\Downloads\ffmpeg-2025-05-26-git-43a69886b2-full_build\bin"
import assemblyai as aai

# Replace with your API key
aai.settings.api_key = "898fe3a1ae274f9b9d220dc63006d5e2"

app = FastAPI()

# Load whisper model
model = whisper.load_model("tiny")

# CORS configuration (kept for if you want to use API later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



def local_transcribe(file_path: str):
    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(file_path)

    if transcript.status == aai.TranscriptStatus.error:
        return ""
    else:
        return (transcript.text)


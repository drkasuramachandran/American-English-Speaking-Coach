from __future__ import annotations

import os
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

app = FastAPI(title="American English Speaking Coach API", version="2.0.0")

origins = [x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_SAFETY_IDENTIFIER = os.getenv("OPENAI_SAFETY_IDENTIFIER", "american-english-speaking-coach-local")

LANGUAGE_CODES = {
    "English (US)": "en",
    "Japanese": "ja",
    "Hindi": "hi",
    "Tamil": "ta",
    "Telugu": "te",
    "Malayalam": "ml",
    "Spanish": "es",
    "French": "fr",
    "German": "de",
    "Korean": "ko",
    "Chinese (Mandarin)": "zh",
}


class TranslationSessionRequest(BaseModel):
    target_language: str = Field(min_length=2)
    source_language: str | None = None


@app.get("/")
async def root():
    return {
        "name": "American English Speaking Coach API",
        "status": "running",
        "realtime_translation": True,
        "model": "gpt-realtime-translate",
    }


@app.get("/health")
async def health():
    return {"status": "ok", "realtime_translation": bool(OPENAI_API_KEY)}


@app.post("/api/realtime/session")
async def create_realtime_translation_session(payload: TranslationSessionRequest):
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not configured. Add it to backend/.env before starting the backend.",
        )

    target = LANGUAGE_CODES.get(payload.target_language, payload.target_language.lower()[:2])
    source = LANGUAGE_CODES.get(payload.source_language or "", None)

    session: dict = {
        "model": "gpt-realtime-translate",
        "audio": {
            "output": {"language": target},
            "input": {
                "noise_reduction": {"type": "near_field"},
                "transcription": {},
            },
        },
    }
    if source:
        session["audio"]["input"]["transcription"]["language"] = source

    body = {
        "expires_after": {"anchor": "created_at", "seconds": 600},
        "session": session,
    }

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    if OPENAI_SAFETY_IDENTIFIER:
        headers["OpenAI-Safety-Identifier"] = OPENAI_SAFETY_IDENTIFIER

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.openai.com/v1/realtime/translations/client_secrets",
                headers=headers,
                json=body,
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Could not reach OpenAI: {exc}") from exc

    if not response.is_success:
        try:
            detail = response.json()
        except Exception:
            detail = response.text
        raise HTTPException(status_code=response.status_code, detail=detail)

    data = response.json()
    return {
        "client_secret": data["value"],
        "expires_at": data.get("expires_at"),
        "session": data.get("session"),
    }

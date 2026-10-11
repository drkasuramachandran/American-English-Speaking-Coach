# Realtime Translator Test

## What changed

The translator no longer uses browser `SpeechRecognition`, a `/api/translate` REST call, or browser `speechSynthesis` for the translation pipeline.

It now uses:

1. Browser microphone capture with `getUserMedia()`.
2. A FastAPI backend to mint a short-lived Realtime Translation client secret.
3. WebRTC to stream microphone audio to the dedicated translation endpoint.
4. `gpt-realtime-translate` to return translated audio and transcript deltas while the source audio is still arriving.
5. A WebRTC remote audio track for translated speech.
6. A WebRTC data channel for live transcript events.

## Test locally

### Terminal 1 — backend

```bat
cd backend
python -m pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` and put your API key in `OPENAI_API_KEY`.

Then:

```bat
python -m uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

Check:

`http://127.0.0.1:8000/health`

### Terminal 2 — frontend

```bat
cd frontend
npm install
npm run dev
```

Open:

`http://localhost:3000/translator`

Allow microphone access and click **Start real-time translation**.

## Acceptance test

Try:

- Japanese → English
- English → Japanese
- short phrases
- long sentences
- pauses between sentences
- fast speech
- names and numbers
- several sentences without pressing Stop

Expected behavior:

- the microphone remains connected during the session;
- source transcript updates live;
- translated transcript streams into the translation panel;
- translated speech is played through the browser audio output;
- there is no fixed/demo sentence in the translation pipeline.

## Important production note

Do not put `OPENAI_API_KEY` in the React frontend or commit `backend/.env` to GitHub.

GitHub Pages can host the frontend, but a separate HTTPS backend is required to safely mint the short-lived client secret. Set `VITE_API_BASE_URL` to that backend before the production build.

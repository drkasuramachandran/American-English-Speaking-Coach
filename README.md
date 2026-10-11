# American English Speaking Coach

An American English speaking practice app with a **real-time voice translation** mode.

## Realtime translator

The translator now uses OpenAI's dedicated **Realtime Translation** API with **WebRTC**:

`Microphone → live WebRTC audio → gpt-realtime-translate → translated audio + transcript deltas`

This is different from the previous browser SpeechRecognition → REST translation → browser speechSynthesis approach. The new translator maintains a live audio session and receives translated speech while audio is still arriving.

### Local setup

1. Create `backend/.env` from `backend/.env.example`.
2. Add your OpenAI API key to `OPENAI_API_KEY`.
3. Start the backend:

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

4. In a second terminal start the frontend:

```bash
cd frontend
npm install
npm run dev
```

5. Open the Vite URL, normally `http://localhost:3000/translator`.
6. Allow microphone access and click **Start real-time translation**.

### Security

The standard OpenAI API key is used only by the backend. It is never placed in frontend code. The backend creates a short-lived Realtime Translation client secret, which the browser uses to establish the WebRTC session.

### Production / GitHub Pages

GitHub Pages can host the frontend, but it cannot safely hold the standard OpenAI API key. You need a separate HTTPS backend for `/api/realtime/session` and set `VITE_API_BASE_URL` to that backend before building the frontend.

Do not commit `backend/.env` or any API key to GitHub.

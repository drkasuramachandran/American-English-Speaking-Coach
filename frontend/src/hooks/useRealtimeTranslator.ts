import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export type RealtimeTranslatorState = 'idle' | 'connecting' | 'live' | 'stopping' | 'error';

type SessionResponse = {
  client_secret: string;
  expires_at?: number;
};

type EventMessage = {
  type?: string;
  delta?: string;
  transcript?: string;
  error?: { message?: string };
};

export function useRealtimeTranslator() {
  const [state, setState] = useState<RealtimeTranslatorState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sourceTranscript, setSourceTranscript] = useState('');
  const [targetTranscript, setTargetTranscript] = useState('');
  const [lastTarget, setLastTarget] = useState('');

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldStopRef = useRef(false);

  const cleanup = useCallback(() => {
    dcRef.current?.close();
    dcRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }
    audioRef.current = null;
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, []);

  const stop = useCallback(() => {
    shouldStopRef.current = true;
    setState('stopping');
    cleanup();
    setState('idle');
  }, [cleanup]);

  const start = useCallback(async (sourceLanguage: string, targetLanguage: string) => {
    if (state === 'connecting' || state === 'live') return;

    setError(null);
    setSourceTranscript('');
    setTargetTranscript('');
    setLastTarget('');
    shouldStopRef.current = false;
    setState('connecting');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access requires a modern browser and HTTPS or localhost.');
      }
      if (!window.RTCPeerConnection) {
        throw new Error('WebRTC is not supported by this browser.');
      }

      const sessionResponse = await fetch(`${API_BASE}/api/realtime/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_language: sourceLanguage,
          target_language: targetLanguage,
        }),
      });
      const sessionData = (await sessionResponse.json()) as SessionResponse & { detail?: unknown };
      if (!sessionResponse.ok || !sessionData.client_secret) {
        throw new Error(typeof sessionData.detail === 'string' ? sessionData.detail : 'Could not create a realtime translation session.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      pc.addTrack(stream.getAudioTracks()[0], stream);

      const audio = new Audio();
      audio.autoplay = true;
      audioRef.current = audio;
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) audio.srcObject = remoteStream;
      };

      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;
      dc.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as EventMessage;
          if (message.type === 'session.input_transcript.delta' && message.delta) {
            setSourceTranscript((current) => current + message.delta);
          }
          if (message.type === 'session.output_transcript.delta' && message.delta) {
            setTargetTranscript((current) => current + message.delta);
            setLastTarget((current) => current + message.delta);
          }
          if (message.type === 'error') {
            setError(message.error?.message || 'Realtime translation error.');
            setState('error');
          }
        } catch {
          // Ignore non-JSON data channel messages.
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') setState('live');
        if (['failed', 'disconnected'].includes(pc.connectionState) && !shouldStopRef.current) {
          setError('The realtime connection was interrupted. Please start again.');
          setState('error');
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch('https://api.openai.com/v1/realtime/translations/calls', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionData.client_secret}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const answer = await response.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answer });
    } catch (err) {
      cleanup();
      const message = err instanceof Error ? err.message : 'Unable to start realtime translation.';
      setError(message);
      setState('error');
    }
  }, [cleanup, state]);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    state,
    listening: state === 'connecting' || state === 'live',
    error,
    sourceTranscript,
    targetTranscript,
    lastTarget,
    start,
    stop,
    setMuted,
  };
}

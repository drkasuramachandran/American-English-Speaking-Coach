import { useCallback, useEffect, useRef, useState } from 'react';

interface SRAlternative { transcript: string }
interface SRResult { isFinal: boolean; 0: SRAlternative; length: number }
interface SREvent { resultIndex: number; results: ArrayLike<SRResult> }
interface SRErrorEvent { error: string }
interface SRInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SRConstructor = new () => SRInstance;

function getCtor(): SRConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERRORS: Record<string, string> = {
  'not-allowed': 'Microphone access was blocked. Allow microphone access in your browser.',
  'service-not-allowed': 'Speech recognition is not allowed in this browser.',
  'no-speech': "I didn't hear anything. Try speaking again.",
  'audio-capture': 'No microphone was found.',
  network: 'Speech recognition needs an internet connection.',
};

export function useLiveTranslator(
  onFinal: (text: string) => void,
  onInterim?: (text: string) => void,
) {
  const supported = getCtor() !== null;
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SRInstance | null>(null);
  const shouldContinueRef = useRef(false);
  const cbFinal = useRef(onFinal);
  const cbInterim = useRef(onInterim);
  cbFinal.current = onFinal;
  cbInterim.current = onInterim;

  const start = useCallback((language: string) => {
    const Ctor = getCtor();
    if (!Ctor) {
      setError('Live speech recognition is not supported here. Use Chrome or Edge.');
      return;
    }
    setError(null);
    shouldContinueRef.current = true;

    const rec = new Ctor();
    rec.lang = language;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const r = e.results[i];
        const text = r[0].transcript.trim();
        if (r.isFinal && text) cbFinal.current(text);
        else interim += `${text} `;
      }
      cbInterim.current?.(interim.trim());
    };

    rec.onerror = (e) => {
      if (e.error !== 'aborted') setError(ERRORS[e.error] ?? `Speech recognition error: ${e.error}`);
    };

    rec.onend = () => {
      recRef.current = null;
      if (shouldContinueRef.current) {
        // Chrome may end continuous recognition after a short silence.
        setTimeout(() => {
          if (!shouldContinueRef.current) return;
          try {
            const next = new Ctor();
            next.lang = language;
            next.continuous = true;
            next.interimResults = true;
            next.onresult = rec.onresult;
            next.onerror = rec.onerror;
            next.onend = rec.onend;
            recRef.current = next;
            next.start();
            setListening(true);
          } catch {
            setListening(false);
          }
        }, 120);
      } else {
        setListening(false);
      }
    };

    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError('Could not start the microphone. Please try again.');
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    shouldContinueRef.current = false;
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }, []);

  useEffect(() => () => {
    shouldContinueRef.current = false;
    recRef.current?.abort();
  }, []);

  return { supported, listening, error, start, stop };
}

import { useCallback, useEffect, useRef, useState } from 'react';

/* Minimal typings — the Web Speech API is not in TypeScript's lib.dom. */
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

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone access was blocked. Allow it in your browser, or type your answer.',
  'service-not-allowed': 'Speech recognition is not allowed in this browser. Type your answer instead.',
  'no-speech': "I didn't hear anything — try again and speak a little closer to the mic.",
  'audio-capture': 'No microphone found. Plug one in, or type your answer.',
  network: 'Speech recognition needs an internet connection in this browser.',
};

/** Real speech-to-text via the browser's Web Speech API (Chrome, Edge, Safari). */
export function useSpeechRecognition(onFinal: (text: string) => void, onInterim?: (text: string) => void) {
  const supported = getCtor() !== null;
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SRInstance | null>(null);
  const finalRef = useRef('');
  const cbFinal = useRef(onFinal);
  const cbInterim = useRef(onInterim);
  cbFinal.current = onFinal;
  cbInterim.current = onInterim;

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    setError(null);
    finalRef.current = '';
    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const r = e.results[i];
        if (r.isFinal) finalRef.current += `${r[0].transcript} `;
        else interim += r[0].transcript;
      }
      cbInterim.current?.((finalRef.current + interim).trim());
    };
    rec.onerror = (e) => {
      if (e.error !== 'aborted') setError(ERROR_MESSAGES[e.error] ?? `Speech recognition error: ${e.error}`);
    };
    rec.onend = () => {
      setListening(false);
      const text = finalRef.current.trim();
      if (text) cbFinal.current(text);
      recRef.current = null;
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError('Could not start the microphone. Please try again.');
    }
  }, []);

  const stop = useCallback(() => recRef.current?.stop(), []);

  useEffect(() => () => recRef.current?.abort(), []);

  return { supported, listening, error, start, stop };
}

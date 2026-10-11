import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

type DemoState = 'idle' | 'recording' | 'processing';

interface SpeakingButtonProps {
  /** Used only when the browser has no speech recognition (e.g. Firefox): simulated transcript. */
  demoTranscript: string;
  /** Final transcript once the user stops speaking. */
  onTranscript: (text: string) => void;
  /** Live (partial) transcript while the user is speaking. */
  onInterim?: (text: string) => void;
  disabled?: boolean;
}

const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/**
 * Real speech-to-text through the Web Speech API when available; otherwise
 * falls back to the original simulated recording so the demo still works.
 */
export default function SpeakingButton({
  demoTranscript,
  onTranscript,
  onInterim,
  disabled = false,
}: SpeakingButtonProps) {
  const { supported, listening, error, start, stop } = useSpeechRecognition(onTranscript, onInterim);

  const [demoState, setDemoState] = useState<DemoState>('idle');
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const procRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recording = supported ? listening : demoState === 'recording';
  const processing = !supported && demoState === 'processing';

  // One shared elapsed-time clock for both real and demo recording.
  useEffect(() => {
    if (!recording) return;
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  useEffect(
    () => () => {
      if (procRef.current) clearTimeout(procRef.current);
    },
    [],
  );

  const handleStart = () => {
    if (supported) return start();
    setDemoState('recording');
  };

  const handleStop = () => {
    if (supported) return stop();
    setDemoState('processing');
    procRef.current = setTimeout(() => {
      setDemoState('idle');
      onTranscript(demoTranscript);
    }, 1500);
  };

  let button;
  if (recording) {
    button = (
      <button
        type="button"
        onClick={handleStop}
        data-testid="speaking-button"
        aria-label="Stop recording"
        className="flex items-center gap-3 rounded-full bg-red-500 px-5 py-3 text-white shadow-md transition-transform hover:scale-[1.02]"
      >
        <span className="flex items-center gap-[3px]" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="block w-1 rounded-full bg-white/90 animate-wave"
              style={{ height: '18px', animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </span>
        <span className="text-sm font-semibold tabular-nums">{mmss(seconds)}</span>
        <Square className="h-4 w-4 fill-white" />
        <span className="text-sm font-medium">Stop</span>
      </button>
    );
  } else if (processing) {
    button = (
      <button
        type="button"
        disabled
        data-testid="speaking-button"
        className="flex items-center gap-2.5 rounded-full bg-slate-700 px-5 py-3 text-white shadow-md"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">Transcribing…</span>
      </button>
    );
  } else {
    button = (
      <button
        type="button"
        onClick={handleStart}
        disabled={disabled}
        data-testid="speaking-button"
        className="flex items-center gap-2.5 rounded-full bg-brand-600 px-5 py-3 text-white shadow-md transition-all hover:bg-brand-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none animate-pulse-ring disabled:animate-none"
      >
        <Mic className="h-4 w-4" />
        <span className="text-sm font-semibold">Start Speaking</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {button}
      {error && (
        <p role="alert" className="max-w-xs text-xs text-red-600" data-testid="speech-error">
          {error}
        </p>
      )}
      {!supported && !recording && !processing && (
        <p className="max-w-xs text-xs text-slate-400">
          Voice input isn&apos;t supported in this browser — using a demo recording. Try Chrome, Edge or Safari.
        </p>
      )}
    </div>
  );
}

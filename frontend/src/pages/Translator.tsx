import { useEffect, useState } from 'react';
import { ArrowDownUp, Languages, Mic, MicOff, Radio, Volume2, VolumeX } from 'lucide-react';
import { useRealtimeTranslator } from '../hooks/useRealtimeTranslator';

type Lang = { label: string; code: string };
const LANGUAGES: Lang[] = [
  { label: 'English (US)', code: 'en' },
  { label: 'Japanese', code: 'ja' },
  { label: 'Hindi', code: 'hi' },
  { label: 'Tamil', code: 'ta' },
  { label: 'Telugu', code: 'te' },
  { label: 'Malayalam', code: 'ml' },
  { label: 'Spanish', code: 'es' },
  { label: 'French', code: 'fr' },
  { label: 'German', code: 'de' },
  { label: 'Korean', code: 'ko' },
  { label: 'Chinese (Mandarin)', code: 'zh' },
];

export default function Translator() {
  const [source, setSource] = useState('Japanese');
  const [target, setTarget] = useState('English (US)');
  const [voiceOn, setVoiceOn] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const { state, listening, error, sourceTranscript, targetTranscript, start, stop, setMuted } = useRealtimeTranslator();

  useEffect(() => {
    setMuted(!voiceOn);
  }, [voiceOn, setMuted]);

  useEffect(() => {
    if (targetTranscript.trim()) {
      setHistory((items) => {
        const last = items[items.length - 1];
        if (last === targetTranscript.trim()) return items;
        return [...items.slice(-3), targetTranscript.trim()];
      });
    }
  }, [targetTranscript]);

  const sourceLang = LANGUAGES.find((item) => item.label === source)!;
  const targetLang = LANGUAGES.find((item) => item.label === target)!;

  const startStop = () => {
    if (listening) stop();
    else start(sourceLang.code, targetLang.code);
  };

  const swap = () => {
    if (listening) stop();
    setSource(target);
    setTarget(source);
    setHistory([]);
  };

  return (
    <div className="app-container py-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Radio className="h-3.5 w-3.5" /> REALTIME TRANSLATION
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Real-Time Voice Translator</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            This version uses a live WebRTC audio session. Your microphone is streamed continuously to the realtime translation service, while translated audio and transcript updates arrive as the conversation continues.
          </p>
        </div>

        <div className="grid items-end gap-5 lg:grid-cols-[1fr_auto_1fr]">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">You speak</span>
            <select value={source} onChange={(e) => setSource(e.target.value)} disabled={listening}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium shadow-sm outline-none focus:border-brand-500">
              {LANGUAGES.map((lang) => <option key={lang.label}>{lang.label}</option>)}
            </select>
          </label>

          <button type="button" onClick={swap} disabled={listening}
            className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:text-brand-600 disabled:opacity-40" aria-label="Swap languages">
            <ArrowDownUp className="h-5 w-5" />
          </button>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">Translate to</span>
            <select value={target} onChange={(e) => setTarget(e.target.value)} disabled={listening}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium shadow-sm outline-none focus:border-brand-500">
              {LANGUAGES.map((lang) => <option key={lang.label}>{lang.label}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className={`h-2.5 w-2.5 rounded-full ${state === 'live' ? 'animate-pulse bg-emerald-500' : state === 'connecting' ? 'animate-pulse bg-amber-500' : 'bg-slate-300'}`} />
              {state === 'live' ? 'LIVE AUDIO STREAM' : state === 'connecting' ? 'CONNECTING…' : state === 'stopping' ? 'STOPPING…' : 'READY'}
            </div>
            <span className="text-xs text-slate-400">WebRTC · gpt-realtime-translate</span>
          </div>

          <div className="grid min-h-[360px] gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-400"><Languages className="h-4 w-4" /> LIVE SOURCE TRANSCRIPT</div>
              <p className="min-h-28 text-lg leading-8 text-slate-800">{sourceTranscript || 'Start speaking. Your live transcript will appear here…'}</p>
              <p className="mt-5 text-xs text-slate-400">Microphone audio stays live while this session is running.</p>
            </div>

            <div className="rounded-2xl bg-brand-50/60 p-5">
              <div className="mb-3 flex items-center justify-between text-xs font-semibold text-brand-700">
                <span>LIVE TRANSLATION</span>
                {state === 'live' && <span className="animate-pulse">Streaming…</span>}
              </div>
              <p className="min-h-28 text-lg font-medium leading-8 text-slate-900">{targetTranscript || 'Translated speech and text will appear here…'}</p>
              {history.length > 1 && (
                <div className="mt-5 space-y-2 border-t border-brand-100 pt-4">
                  {history.slice(-3, -1).map((item, index) => <div key={`${item}-${index}`} className="rounded-lg bg-white/70 p-2 text-sm text-slate-600">{item}</div>)}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={startStop}
              className={`inline-flex h-14 items-center gap-3 rounded-full px-7 text-sm font-bold text-white shadow-lg transition ${listening ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-600 hover:bg-brand-700'}`}>
              {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {listening ? 'Stop translation' : 'Start real-time translation'}
            </button>

            <button type="button" onClick={() => setVoiceOn((value) => !value)}
              className="grid h-12 w-12 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-brand-600" aria-label={voiceOn ? 'Mute translated voice' : 'Enable translated voice'}>
              {voiceOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>

            <button type="button" onClick={() => setHistory([])} className="h-12 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:text-slate-900">Clear history</button>
          </div>

          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-center text-xs text-slate-500">
            {voiceOn ? 'Translated audio is played automatically through your speakers.' : 'Translated audio is muted in the interface.'}
            <span className="mx-1">•</span> You can change languages only while the session is stopped.
          </div>

          {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-center text-sm text-red-700">{error}</p>}
        </div>
      </div>
    </div>
  );
}

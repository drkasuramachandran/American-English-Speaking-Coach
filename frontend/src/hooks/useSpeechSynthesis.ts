import { useCallback, useEffect, useState } from 'react';

/** Text-to-speech via the browser's speechSynthesis (free, offline-capable). */
export function useSpeechSynthesis() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en')));
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, [supported]);

  const speak = useCallback(
    (text: string, opts: { voiceName?: string; rate?: number } = {}) => {
      if (!supported || !text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const all = window.speechSynthesis.getVoices();
      const chosen =
        all.find((v) => opts.voiceName && v.name === opts.voiceName) ??
        all.find((v) => v.lang === 'en-US') ??
        all.find((v) => v.lang.toLowerCase().startsWith('en'));
      if (chosen) u.voice = chosen;
      u.lang = chosen?.lang ?? 'en-US';
      u.rate = opts.rate ?? 0.95;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [supported],
  );

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);

  return { supported, voices, speaking, speak, cancel };
}

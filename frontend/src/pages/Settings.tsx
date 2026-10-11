import type { ReactNode } from 'react';
import { Volume2, Target, MessageSquareText, Database, Play } from 'lucide-react';
import type { FeedbackTone } from '../types';
import { useApp } from '../context/AppContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

const tones: { id: FeedbackTone; label: string; hint: string }[] = [
  { id: 'encouraging', label: 'Encouraging', hint: 'Warm, up to 3 tips' },
  { id: 'direct', label: 'Direct', hint: 'Short, top 2 fixes' },
  { id: 'detailed', label: 'Detailed', hint: 'Every tip we find' },
];

function Section({ icon: Icon, title, description, children }: {
  icon: typeof Volume2; title: string; description: string; children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{description}</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function Settings() {
  const { settings, updateSettings, hasSampleData, clearSampleData, resetProgress } = useApp();
  const tts = useSpeechSynthesis();

  return (
    <div className="app-container pt-10 sm:pt-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Settings</h1>
      <p className="mt-2 text-slate-500">Personalize your coaching experience. Saved on this device.</p>

      <div className="mt-6 space-y-4">
        <Section icon={MessageSquareText} title="Feedback style" description="How much detail the coach gives after each answer.">
          <div role="radiogroup" aria-label="Feedback style" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {tones.map((t) => {
              const active = settings.feedbackTone === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => updateSettings({ feedbackTone: t.id })}
                  className={`rounded-xl border px-3.5 py-3 text-left transition-colors ${
                    active ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`text-sm font-semibold ${active ? 'text-brand-700' : 'text-slate-800'}`}>{t.label}</div>
                  <div className="text-xs text-slate-500">{t.hint}</div>
                </button>
              );
            })}
          </div>
        </Section>

        <Section icon={Volume2} title="Coach voice" description="The coach can read questions and corrections aloud.">
          <label className="flex items-center justify-between gap-3 text-sm text-slate-700">
            Read questions aloud automatically
            <input
              type="checkbox"
              checked={settings.speakQuestions}
              onChange={(e) => updateSettings({ speakQuestions: e.target.checked })}
              className="h-5 w-5 accent-brand-600"
            />
          </label>

          {tts.supported ? (
            <div className="mt-4 space-y-4">
              <label className="block text-sm text-slate-700">
                Voice
                <select
                  value={settings.voiceName}
                  onChange={(e) => updateSettings({ voiceName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                >
                  <option value="">Automatic (US English)</option>
                  {tts.voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-700">
                Speed: {settings.speechRate.toFixed(2)}×
                <input
                  type="range"
                  min={0.6}
                  max={1.2}
                  step={0.05}
                  value={settings.speechRate}
                  onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })}
                  className="mt-1 w-full accent-brand-600"
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  tts.speak("Hi! I'm your American English coach. Let's practice.", {
                    voiceName: settings.voiceName,
                    rate: settings.speechRate,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-200 hover:text-brand-700"
              >
                <Play className="h-4 w-4" /> Preview voice
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-amber-700">This browser doesn&apos;t support spoken playback.</p>
          )}
        </Section>

        <Section icon={Target} title="Daily goal" description="How many practice sessions you want to finish each day.">
          <div className="flex gap-2">
            {[1, 2, 3, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => updateSettings({ dailyGoal: n })}
                aria-pressed={settings.dailyGoal === n}
                className={`h-10 w-12 rounded-xl border text-sm font-semibold transition-colors ${
                  settings.dailyGoal === n
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={Database} title="Your data" description="Everything stays in this browser — nothing is uploaded.">
          <div className="flex flex-wrap gap-2">
            {hasSampleData && (
              <button
                type="button"
                onClick={clearSampleData}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-200 hover:text-brand-700"
              >
                Clear sample data
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete all practice history on this device?')) resetProgress();
              }}
              className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Reset all progress
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

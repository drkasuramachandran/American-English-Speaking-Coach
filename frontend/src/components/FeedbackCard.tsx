import { Sparkles, Quote, Volume2 } from 'lucide-react';
import type { Feedback } from '../types';
import ScoreCard from './ScoreCard';

interface FeedbackCardProps {
  feedback: Feedback;
  /** Lets the learner hear the improved sentence read aloud. */
  onSpeak?: (text: string) => void;
}

export default function FeedbackCard({ feedback, onSpeak }: FeedbackCardProps) {
  const { scores, originalText, improvedText, explanation } = feedback;

  return (
    <div
      className="mt-2 rounded-2xl border border-brand-100 bg-brand-50/40 p-4 sm:p-5 animate-fade-in-up"
      data-testid="feedback-card"
    >
      <div className="flex items-center gap-2 text-brand-700">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-semibold">American English Feedback</span>
      </div>

      {/* Scores */}
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <ScoreCard label="Grammar" value={scores.grammar} compact />
        <ScoreCard label="Naturalness" value={scores.naturalness} compact />
        <ScoreCard label="Vocabulary" value={scores.vocabulary} compact />
        <ScoreCard label="Fluency" value={scores.fluency} compact />
      </div>

      {/* Comparison */}
      <div className="mt-4 space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Quote className="h-3.5 w-3.5" />
            You said
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{originalText}</p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              More natural American English
            </span>
            {onSpeak && (
              <button
                type="button"
                onClick={() => onSpeak(improvedText)}
                aria-label="Listen to the improved sentence"
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                <Volume2 className="h-3.5 w-3.5" />
                Listen
              </button>
            )}
          </div>
          <p className="mt-1 text-sm font-medium leading-relaxed text-emerald-900">
            {improvedText}
          </p>
        </div>
      </div>

      {/* Why */}
      <div className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Why</div>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{explanation}</p>
      </div>
    </div>
  );
}

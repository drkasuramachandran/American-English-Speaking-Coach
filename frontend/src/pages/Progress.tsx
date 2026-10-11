import { Link } from 'react-router-dom';
import { MessageSquare, Clock, Award, Mic } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aggregateSubScores, getScenario } from '../data/mockData';
import type { Scores } from '../types';
import ScoreCard from '../components/ScoreCard';
import ProgressChart from '../components/ProgressChart';

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds} sec`;
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Progress() {
  const { sessions } = useApp();

  const conversations = sessions.length;
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const avgScore =
    conversations === 0
      ? 0
      : Math.round(sessions.reduce((sum, s) => sum + s.averageScore, 0) / conversations);

  // Skill breakdown: average of real sessions; sample-only data falls back to sample numbers.
  const scored = sessions.filter((s) => s.scores);
  const avgOf = (k: keyof Scores): number =>
    scored.length
      ? Math.round(scored.reduce((sum, s) => sum + s.scores![k], 0) / scored.length)
      : (aggregateSubScores as Partial<Scores>)[k] ?? 0;

  const recent = sessions.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const stats = [
    { label: 'Conversations', value: String(conversations), icon: MessageSquare },
    { label: 'Speaking time', value: formatDuration(totalSeconds), icon: Clock },
    { label: 'Average score', value: String(avgScore), icon: Award },
  ];

  return (
    <div className="app-container pt-10 sm:pt-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your progress</h1>
      <p className="mt-2 text-slate-500">A snapshot of how your American English is improving.</p>

      {conversations === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No sessions yet — your results will appear here.</p>
          <Link to="/practice/job-interview" className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            <Mic className="h-4 w-4" /> Start your first session
          </Link>
        </div>
      )}

      {/* Summary stats */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-2 text-slate-400">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">{stat.label}</span>
              </div>
              <div className="mt-2 text-3xl font-extrabold tabular-nums text-slate-900">
                {stat.value}
              </div>
            </div>
          );
        })}
      </section>

      {/* Sub-scores */}
      {conversations > 0 && (
      <>
      <section className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Skill breakdown</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ScoreCard label="Grammar" value={avgOf('grammar')} />
          <ScoreCard label="Fluency" value={avgOf('fluency')} />
          <ScoreCard label="Vocabulary" value={avgOf('vocabulary')} />
        </div>
      </section>

      {/* Chart */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-slate-900">Score over time</h2>
        <p className="text-sm text-slate-400">Average score across your recent sessions</p>
        <div className="mt-4">
          <ProgressChart sessions={sessions} />
        </div>
      </section>

      {/* Recent sessions */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Recent sessions</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          {recent.map((session, i) => {
            const scenario = getScenario(session.scenarioId);
            const Icon = scenario?.icon;
            return (
              <div
                key={session.id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i !== recent.length - 1 ? 'border-b border-slate-100' : ''
                }`}
                data-testid="recent-session-row"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  {Icon && <Icon className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {scenario?.title ?? session.scenarioId}
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatDate(session.date)} · {formatDuration(session.durationSeconds)} ·{' '}
                    {session.turnsCompleted} turns
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold tabular-nums text-slate-900">
                    {session.averageScore}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">score</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      </>
      )}
    </div>
  );
}

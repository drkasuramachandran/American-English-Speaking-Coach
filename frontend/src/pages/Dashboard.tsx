import { useNavigate } from 'react-router-dom';
import { Mic, Target, TrendingUp, Flame } from 'lucide-react';
import { scenarios } from '../data/mockData';
import { useApp } from '../context/AppContext';
import ScenarioCard from '../components/ScenarioCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { completedToday, dailyGoal, streak } = useApp();

  const pct = Math.min(100, Math.round((completedToday / dailyGoal) * 100));
  const circumference = 2 * Math.PI * 26;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="app-container pt-10 sm:pt-14">
      {/* Hero */}
      <section className="animate-fade-in-up">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <TrendingUp className="h-3.5 w-3.5" />
          Speak with confidence
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          American English
          <br className="hidden sm:block" /> Speaking Coach
        </h1>
        <p className="mt-3 text-base text-slate-500 sm:text-lg">Practice. Speak. Improve.</p>
      </section>

      {/* CTA + today's progress */}
      <section className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <button
          type="button"
          onClick={() => navigate('/practice/job-interview')}
          data-testid="start-practice-button"
          className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-600 px-7 py-4 text-base font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg sm:w-fit"
        >
          <Mic className="h-5 w-5" />
          Start Practice
        </button>

        <div
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
          data-testid="today-progress"
        >
          <div className="relative h-16 w-16 shrink-0">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="26" fill="none" stroke="#e2e8f0" strokeWidth="6" />
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke="#2563eb"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-[stroke-dashoffset] duration-700 ease-out"
              />
            </svg>
            <Target className="absolute inset-0 m-auto h-5 w-5 text-brand-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Today&apos;s goal</div>
            <div className="text-sm text-slate-500" data-testid="today-progress-text">
              {completedToday} of {dailyGoal} sessions
            </div>
            {streak > 0 && (
              <div className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-orange-600" data-testid="streak">
                <Flame className="h-3.5 w-3.5" />
                {streak}-day streak
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Scenario grid */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Choose a scenario</h2>
          <span className="text-sm text-slate-400">{scenarios.length} available</span>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, i) => (
            <ScenarioCard key={scenario.id} scenario={scenario} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

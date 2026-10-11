import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Scenario } from '../types';

interface ScenarioCardProps {
  scenario: Scenario;
  index?: number;
}

export default function ScenarioCard({ scenario, index = 0 }: ScenarioCardProps) {
  const navigate = useNavigate();
  const Icon = scenario.icon;

  return (
    <button
      type="button"
      onClick={() => navigate(`/practice/${scenario.id}`)}
      data-testid={`scenario-card-${scenario.id}`}
      className="group relative flex w-full flex-col items-start rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{scenario.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{scenario.description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
        Start practice
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

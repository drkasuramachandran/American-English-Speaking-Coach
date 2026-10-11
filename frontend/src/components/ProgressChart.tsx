import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { PracticeSession } from '../types';

interface ProgressChartProps {
  sessions: PracticeSession[];
}

function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`); // local, not UTC
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ProgressChart({ sessions }: ProgressChartProps) {
  const data = sessions
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => ({ date: shortDate(s.date), score: s.averageScore }));

  return (
    <div className="h-64 w-full" data-testid="progress-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
              fontSize: 13,
            }}
            labelStyle={{ color: '#64748b', fontWeight: 600 }}
            formatter={(value: number) => [`${value}`, 'Score']}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


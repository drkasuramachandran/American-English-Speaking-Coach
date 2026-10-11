import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
const Progress = lazy(() => import('./pages/Progress')); // keeps recharts out of the main bundle
import Settings from './pages/Settings';
import Translator from './pages/Translator';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-24 sm:pb-12">
        <Suspense fallback={<div className="app-container pt-16 text-center text-sm text-slate-400">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/practice/:scenarioId" element={<Practice />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/translator" element={<Translator />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
        </Suspense>
      </main>
    </div>
  );
}

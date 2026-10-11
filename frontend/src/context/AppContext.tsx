import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PracticeSession, Settings } from '../types';
import { mockSessions } from '../data/mockData';
import { loadJSON, localDate, saveJSON } from '../lib/storage';

const SESSIONS_KEY = 'aesc.sessions.v1';
const SETTINGS_KEY = 'aesc.settings.v1';

export const defaultSettings: Settings = {
  feedbackTone: 'encouraging',
  speakQuestions: true,
  voiceName: '',
  speechRate: 0.95,
  dailyGoal: 3,
};

interface AppContextValue {
  /** Real sessions finished today (persisted; survives reloads). */
  completedToday: number;
  /** Consecutive days (ending today or yesterday) with at least one real session. */
  streak: number;
  dailyGoal: number;
  sessions: PracticeSession[];
  hasSampleData: boolean;
  settings: Settings;
  addSession: (session: PracticeSession) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  clearSampleData: () => void;
  resetProgress: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function computeStreak(sessions: PracticeSession[]): number {
  const days = new Set(sessions.filter((s) => !s.sample).map((s) => s.date));
  const cursor = new Date();
  if (!days.has(localDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<PracticeSession[]>(() =>
    loadJSON<PracticeSession[]>(
      SESSIONS_KEY,
      mockSessions.map((s) => ({ ...s, sample: true })),
    ),
  );
  const [settings, setSettings] = useState<Settings>(() => ({
    ...defaultSettings,
    ...loadJSON<Partial<Settings>>(SETTINGS_KEY, {}),
  }));

  useEffect(() => saveJSON(SESSIONS_KEY, sessions), [sessions]);
  useEffect(() => saveJSON(SETTINGS_KEY, settings), [settings]);

  const addSession = useCallback(
    (session: PracticeSession) => setSessions((prev) => [...prev, session]),
    [],
  );
  const updateSettings = useCallback(
    (patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch })),
    [],
  );
  const clearSampleData = useCallback(
    () => setSessions((prev) => prev.filter((s) => !s.sample)),
    [],
  );
  const resetProgress = useCallback(() => setSessions([]), []);

  const value = useMemo<AppContextValue>(() => {
    const today = localDate();
    return {
      completedToday: sessions.filter((s) => !s.sample && s.date === today).length,
      streak: computeStreak(sessions),
      dailyGoal: settings.dailyGoal,
      sessions,
      hasSampleData: sessions.some((s) => s.sample),
      settings,
      addSession,
      updateSettings,
      clearSampleData,
      resetProgress,
    };
  }, [sessions, settings, addSession, updateSettings, clearSampleData, resetProgress]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}

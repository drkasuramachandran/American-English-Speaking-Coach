import type { LucideIcon } from 'lucide-react';

export type ScenarioId =
  | 'job-interview'
  | 'academic-presentation'
  | 'everyday-conversation'
  | 'restaurant'
  | 'airport'
  | 'professional-meeting';

export interface Scenario {
  id: ScenarioId;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Scores {
  grammar: number; // 0–100
  naturalness: number; // 0–100
  vocabulary: number; // 0–100
  fluency: number; // 0–100
}

export interface Feedback {
  scores: Scores;
  originalText: string;
  improvedText: string;
  explanation: string;
}

export interface ChatTurn {
  id: string;
  speaker: 'ai' | 'user';
  text: string;
  timestamp: string;
  feedback?: Feedback; // present on user turns after submission
}

export interface PracticeSession {
  id: string;
  scenarioId: ScenarioId;
  /** ISO date (YYYY-MM-DD, local time). */
  date: string;
  durationSeconds: number;
  turnsCompleted: number;
  averageScore: number;
  /** Per-skill averages for this session (absent on older / sample data). */
  scores?: Scores;
  /** True for the built-in sample sessions that can be cleared in Settings. */
  sample?: boolean;
}

export type FeedbackTone = 'encouraging' | 'direct' | 'detailed';

export interface Settings {
  feedbackTone: FeedbackTone;
  /** Speak the coach's questions aloud. */
  speakQuestions: boolean;
  /** Preferred speechSynthesis voice name ('' = auto-pick a US English voice). */
  voiceName: string;
  /** Speech rate 0.6–1.2. */
  speechRate: number;
  dailyGoal: number;
}

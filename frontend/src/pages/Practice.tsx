import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Send, ArrowLeft, GraduationCap, CheckCircle2, Flag, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { ChatTurn, Feedback, PracticeSession, ScenarioId, Scores } from '../types';
import {
  getScenario,
  scenarios,
  jobInterviewScript,
  interviewClosingMessage,
  scenarioScripts,
  overallScore,
} from '../data/mockData';
import { analyzeResponse } from '../lib/feedbackEngine';
import { localDate } from '../lib/storage';
import { useApp } from '../context/AppContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import ChatMessage from '../components/ChatMessage';
import SpeakingButton from '../components/SpeakingButton';
import ScoreCard from '../components/ScoreCard';

const genId = () => Math.random().toString(36).slice(2, 10);
const nowStamp = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const normalize = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s']/g, '').replace(/\s+/g, ' ').trim();

type NonInterview = Exclude<ScenarioId, 'job-interview'>;

function averageScores(turns: ChatTurn[]): Scores | null {
  const fb = turns.filter((t) => t.speaker === 'user' && t.feedback).map((t) => t.feedback!.scores);
  if (!fb.length) return null;
  const avg = (k: keyof Scores) => Math.round(fb.reduce((s, x) => s + x[k], 0) / fb.length);
  return { grammar: avg('grammar'), naturalness: avg('naturalness'), vocabulary: avg('vocabulary'), fluency: avg('fluency') };
}

export default function Practice() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const { addSession, settings } = useApp();
  const tts = useSpeechSynthesis();

  const scenario = getScenario(scenarioId ?? '');
  const isJobInterview = scenarioId === 'job-interview';

  const [thread, setThread] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0); // index of the NEXT unanswered question
  const [aiThinking, setAiThinking] = useState(false);
  const [finished, setFinished] = useState(false);
  const [summary, setSummary] = useState<{ avg: number; scores: Scores; turns: number } | null>(null);
  const [runId, setRunId] = useState(0); // bump to restart the same scenario

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recordedRef = useRef(false);
  const startedAtRef = useRef(Date.now());
  const threadRef = useRef<ChatTurn[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  threadRef.current = thread;

  const speakAloud = useCallback(
    (text: string) => tts.speak(text, { voiceName: settings.voiceName, rate: settings.speechRate }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tts.speak, settings.voiceName, settings.speechRate],
  );
  const autoSpeak = (text: string) => {
    if (settings.speakQuestions) speakAloud(text);
  };

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  // (Re)initialise the conversation whenever the scenario changes or restarts.
  useEffect(() => {
    clearTimers();
    tts.cancel();
    if (!scenario) return;
    recordedRef.current = false;
    startedAtRef.current = Date.now();
    setStep(0);
    setInput('');
    setAiThinking(false);
    setFinished(false);
    setSummary(null);

    const opening = isJobInterview
      ? jobInterviewScript[0].aiQuestion
      : scenarioScripts[scenarioId as NonInterview].opening;

    setThread([{ id: genId(), speaker: 'ai', text: opening, timestamp: nowStamp() }]);
    if (settings.speakQuestions) speakAloud(opening);
    return clearTimers; // never let a pending AI reply land in a different scenario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId, runId]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [thread, aiThinking, summary]);

  if (!scenario) {
    return (
      <div className="app-container pt-16 text-center">
        <p className="text-slate-500">That scenario doesn&apos;t exist.</p>
        <Link to="/" className="mt-3 inline-block font-medium text-brand-600">
          Back to Coach
        </Link>
      </div>
    );
  }

  const pushAiMessage = (text: string, delay = 750) => {
    setAiThinking(true);
    timersRef.current.push(
      setTimeout(() => {
        setThread((prev) => [...prev, { id: genId(), speaker: 'ai', text, timestamp: nowStamp() }]);
        setAiThinking(false);
        autoSpeak(text);
      }, delay),
    );
  };

  /** Saves the session (once) and returns its summary, or null if nothing was answered. */
  const recordSession = (turns: ChatTurn[]) => {
    if (recordedRef.current) return null;
    const userTurns = turns.filter((t) => t.speaker === 'user' && t.feedback);
    if (userTurns.length === 0) return null;
    recordedRef.current = true;
    const scores = averageScores(turns)!;
    const avg = overallScore(scores);
    const session: PracticeSession = {
      id: genId(),
      scenarioId: scenario.id,
      date: localDate(),
      durationSeconds: Math.max(10, Math.round((Date.now() - startedAtRef.current) / 1000)),
      turnsCompleted: userTurns.length,
      averageScore: avg,
      scores,
    };
    addSession(session);
    const result = { avg, scores, turns: userTurns.length };
    setSummary(result);
    return result;
  };

  const buildFeedback = (text: string): Feedback => {
    // Use the hand-written feedback only when the user said (roughly) the demo sentence;
    // anything else is analysed for real so the feedback always matches what was said.
    if (isJobInterview && step < jobInterviewScript.length) {
      const scripted = jobInterviewScript[step];
      if (normalize(text) === normalize(scripted.demoTranscript)) {
        return { ...scripted.feedback, originalText: text };
      }
    }
    return analyzeResponse(text, settings.feedbackTone);
  };

  const handleSend = (raw: string) => {
    const text = raw.trim();
    if (!text || aiThinking || finished) return;
    tts.cancel();

    const userTurn: ChatTurn = {
      id: genId(),
      speaker: 'user',
      text,
      timestamp: nowStamp(),
      feedback: buildFeedback(text),
    };
    const nextThread = [...thread, userTurn];
    setThread(nextThread);
    setInput('');

    const nextStep = step + 1;
    setStep(nextStep);

    if (isJobInterview) {
      if (nextStep < jobInterviewScript.length) {
        pushAiMessage(jobInterviewScript[nextStep].aiQuestion, 900);
      } else {
        setFinished(true);
        pushAiMessage(interviewClosingMessage, 900);
        recordSession(nextThread);
      }
    } else {
      const followUps = scenarioScripts[scenarioId as NonInterview].followUps;
      if (nextStep <= followUps.length) {
        pushAiMessage(followUps[nextStep - 1], 900);
      }
      if (nextStep >= followUps.length) {
        setFinished(true);
        recordSession(nextThread);
      }
    }
  };

  const endEarly = () => {
    clearTimers();
    tts.cancel();
    setAiThinking(false);
    setFinished(true);
    recordSession(threadRef.current);
  };

  const nextScenario =
    scenarios[(scenarios.findIndex((s) => s.id === scenario.id) + 1) % scenarios.length];

  // Current canned transcript — only used by the demo-mode mic fallback.
  const demoTranscript = isJobInterview
    ? jobInterviewScript[Math.min(step, jobInterviewScript.length - 1)].demoTranscript
    : (() => {
        const d = scenarioScripts[scenarioId as NonInterview].demoTranscripts;
        return d[Math.min(step, d.length - 1)];
      })();

  const answered = thread.filter((t) => t.speaker === 'user').length;
  const total = isJobInterview ? jobInterviewScript.length : scenarioScripts[scenarioId as NonInterview].followUps.length + 1;
  const Icon = scenario.icon;

  return (
    <div className="app-container flex h-[calc(100dvh-4rem-6rem)] flex-col pt-4 sm:h-[calc(100dvh-4rem-3rem)] sm:pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          data-testid="practice-back-button"
          aria-label="Back to scenarios"
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Scenario · {Math.min(answered, total)}/{total} answered
          </div>
          <h1 className="truncate text-lg font-semibold leading-tight text-slate-900" data-testid="practice-title">
            {scenario.title}
          </h1>
        </div>
        {tts.supported && (
          <button
            type="button"
            onClick={() => (tts.speaking ? tts.cancel() : speakAloud([...thread].reverse().find((t) => t.speaker === 'ai')?.text ?? ''))}
            aria-label={tts.speaking ? 'Stop coach voice' : 'Replay the last question'}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:text-brand-600"
          >
            {tts.speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        )}
        {!finished && answered > 0 && (
          <button
            type="button"
            onClick={endEarly}
            data-testid="end-session-button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:text-brand-700"
          >
            <Flag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Finish</span>
          </button>
        )}
      </div>

      {/* Conversation thread */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="thin-scroll flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5"
        data-testid="conversation-thread"
      >
        {thread.map((turn) => (
          <ChatMessage key={turn.id} turn={turn} onSpeak={tts.supported ? speakAloud : undefined} />
        ))}

        {aiThinking && (
          <div className="flex items-end gap-2.5" data-testid="ai-typing">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
              <GraduationCap className="h-4 w-4" />
            </span>
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 animate-bounce rounded-full bg-slate-300"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {finished && !aiThinking && (
          <div className="space-y-3" data-testid="session-complete">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {summary ? `Session complete — you scored ${summary.avg}!` : 'Session ended.'}
            </div>
            {summary && (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <ScoreCard label="Grammar" value={summary.scores.grammar} compact />
                <ScoreCard label="Naturalness" value={summary.scores.naturalness} compact />
                <ScoreCard label="Vocabulary" value={summary.scores.vocabulary} compact />
                <ScoreCard label="Fluency" value={summary.scores.fluency} compact />
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setRunId((n) => n + 1)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-200 hover:text-brand-700"
              >
                <RotateCcw className="h-4 w-4" />
                Practice again
              </button>
              <Link
                to={`/practice/${nextScenario.id}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Next: {nextScenario.title}
              </Link>
              <Link to="/progress" className="px-2 text-sm font-medium text-brand-600 underline underline-offset-2">
                View progress
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SpeakingButton
            demoTranscript={demoTranscript}
            onInterim={setInput}
            onTranscript={setInput}
            disabled={aiThinking || finished}
          />

          <form
            className="flex flex-1 items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={finished ? 'Session complete' : 'Speak, or type your response…'}
              aria-label="Your response"
              disabled={aiThinking || finished}
              data-testid="response-input"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:bg-white disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || aiThinking || finished}
              data-testid="send-button"
              aria-label="Send response"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

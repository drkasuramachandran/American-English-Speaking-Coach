import { GraduationCap, Volume2 } from 'lucide-react';
import type { ChatTurn } from '../types';
import FeedbackCard from './FeedbackCard';

interface ChatMessageProps {
  turn: ChatTurn;
  /** Speak any text aloud (coach voice). Omit to hide the listen buttons. */
  onSpeak?: (text: string) => void;
}

export default function ChatMessage({ turn, onSpeak }: ChatMessageProps) {
  const isAi = turn.speaker === 'ai';

  if (isAi) {
    return (
      <div className="flex items-end gap-2.5 animate-fade-in-up" data-testid="chat-message-ai">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
          <GraduationCap className="h-4 w-4" />
        </span>
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <p className="text-sm leading-relaxed text-slate-700">{turn.text}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">{turn.timestamp}</span>
            {onSpeak && (
              <button
                type="button"
                onClick={() => onSpeak(turn.text)}
                aria-label="Listen to this message"
                className="rounded p-0.5 text-slate-400 transition-colors hover:text-brand-600"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end animate-fade-in-up" data-testid="chat-message-user">
      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2.5 text-white shadow-sm">
        <p className="text-sm leading-relaxed">{turn.text}</p>
        <span className="mt-1 block text-right text-[10px] text-brand-100">{turn.timestamp}</span>
      </div>
      {turn.feedback && (
        <div className="mt-2 w-full max-w-[92%] sm:max-w-[85%]">
          <FeedbackCard feedback={turn.feedback} onSpeak={onSpeak} />
        </div>
      )}
    </div>
  );
}

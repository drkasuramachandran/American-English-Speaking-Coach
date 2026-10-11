import type { Feedback, FeedbackTone } from '../types';

/**
 * Lightweight, fully offline "coach" for free-form answers.
 *
 * This is rule-based (no AI, no network). It catches the most common errors
 * of intermediate learners and scores the answer from what was actually
 * said. Replace `analyzeResponse()` with an API call later if you want a real
 * AI model; the return type (`Feedback`) stays the same.
 */

interface Rule {
  id: string;
  test: RegExp;
  replace: string | ((m: string, ...g: string[]) => string);
  tip: string;
  category: 'grammar' | 'naturalness' | 'vocabulary';
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

const RULES: Rule[] = [
  { id: 'i-am-article', test: /\bI am (software|web|mobile|data|full[- ]stack|senior|junior|student|teacher|engineer|developer|designer|manager|doctor|nurse)\b/gi, replace: (_m, w) => `I'm a ${w}`, tip: 'Use "a" before a job or role: "I\'m a developer".', category: 'grammar' },
  { id: 'years-of', test: /\b(\w+) years? (experience)\b/gi, replace: (_m, n) => `${n} years of experience`, tip: 'Say "years of experience".', category: 'grammar' },
  { id: 'i-interested', test: /\bI (interested|excited|worried|confused|tired|happy|sure)\b/gi, replace: (_m, a) => `I'm ${a}`, tip: 'Add the verb "am" ("I\'m") before an adjective.', category: 'grammar' },
  { id: 'dont-has', test: /\b(he|she|it) (don't|do not)\b/gi, replace: (_m, p) => `${p} doesn't`, tip: 'With he/she/it use "doesn\'t".', category: 'grammar' },
  { id: 'third-person-s', test: /\b(company|team|he|she|it|everyone|manager) (work|need|want|like|have|make|do|go|think|build|help|focus|use)\b/gi, replace: (_m, s, v) => `${s} ${v === 'have' ? 'has' : v === 'do' ? 'does' : v === 'go' ? 'goes' : v + 's'}`, tip: 'Add -s to the verb after he/she/it or a singular subject.', category: 'grammar' },
  { id: 'is-it-come', test: /\bIs (it|this|that) (come|include|have|contain)\b/gi, replace: (_m, p, v) => `Does ${p} ${v}`, tip: 'Questions with an action verb use "Does it …?", not "Is it …?".', category: 'grammar' },
  { id: 'a-few-more', test: /\ba few more (minute|day|hour|second|week)\b/gi, replace: (_m, n) => `a few more ${n}s`, tip: 'Use the plural after "a few".', category: 'grammar' },
  { id: 'past-lead', test: /\b(last (?:year|week|month)|yesterday),? I (lead|have|make|go|take|finish|start|build)\b/gi, replace: (_m, t, v) => `${t}, I ${({ lead: 'led', have: 'had', make: 'made', go: 'went', take: 'took', finish: 'finished', start: 'started', build: 'built' } as Record<string, string>)[v.toLowerCase()]}`, tip: 'Use the past tense with "last year / yesterday".', category: 'grammar' },
  { id: 'plural-app', test: /\b(web|mobile) application\b(?!s)/gi, replace: (_m, w) => `${w} applications`, tip: 'Use the plural: "applications".', category: 'grammar' },
  { id: 'plural-product', test: /\b(build|building|make|making|create|creating) (product|feature|tool|app)\b(?!s)/gi, replace: (_m, v, n) => `${v} ${n}s`, tip: 'Use the plural when you mean things in general ("products").', category: 'grammar' },
  { id: 'that-help', test: /\b(products?|tools?|apps?|features?|things|people) that (help|make|allow|let)\b/gi, replace: (_m, n, v) => `${n.replace(/s?$/, 's')} that ${v}`, tip: 'Match the noun and verb (plural noun → "help").', category: 'grammar' },
  { id: 'project-that-have', test: /\bproject that have a\b/gi, replace: 'project with a', tip: '"a project with a tight deadline" flows better than "that have".', category: 'grammar' },
  { id: 'i-want', test: /\bI want to know\b/gi, replace: "I'd like to know", tip: '"I\'d like to" sounds more polite than "I want to".', category: 'naturalness' },
  { id: 'i-would-like', test: /\bI would like\b/gi, replace: "I'd like", tip: 'Use the contraction "I\'d" in spoken English.', category: 'naturalness' },
  { id: 'i-am-contraction', test: /\bI am (going|thinking|looking|working|trying|doing|having)\b/gi, replace: (_m, v) => `I'm ${v}`, tip: 'Contractions ("I\'m") sound natural when speaking.', category: 'naturalness' },
  { id: 'thinking-to', test: /\bthinking to go\b/gi, replace: 'thinking about going', tip: 'After "think about" use the -ing form: "thinking about going".', category: 'grammar' },
  { id: 'very-good', test: /\bvery good\b/gi, replace: 'great', tip: 'Try a stronger word like "great" instead of "very good".', category: 'vocabulary' },
  { id: 'very-bad', test: /\bvery bad\b/gi, replace: 'terrible', tip: 'Try a stronger word like "terrible" instead of "very bad".', category: 'vocabulary' },
  { id: 'very-big', test: /\bvery (big|large)\b/gi, replace: 'huge', tip: 'Try "huge" instead of "very big".', category: 'vocabulary' },
  { id: 'lots-of-people', test: /\bI (?:am )?agree\b/gi, replace: 'I agree', tip: 'Say "I agree" (no "am").', category: 'grammar' },
  { id: 'one-luggage', test: /\bone luggage\b/gi, replace: 'one bag', tip: '"Luggage" is uncountable — say "one bag" or "one piece of luggage".', category: 'grammar' },
  { id: 'go-where', test: /\bwhich gate I should go\b/gi, replace: 'which gate I should go to', tip: 'Keep the preposition: "go to".', category: 'grammar' },
  { id: 'calmly', test: /\bexplain my opinion calm\b/gi, replace: 'explain my opinion calmly', tip: 'Use the adverb "calmly" to describe how you act.', category: 'grammar' },
  { id: 'still-waiting', test: /\bwe still waiting\b/gi, replace: 'we are still waiting', tip: 'Add "are" before the -ing verb.', category: 'grammar' },
  { id: 'focus-past', test: /\bI focus on\b/gi, replace: 'I focused on', tip: 'Use the past tense to talk about this week.', category: 'grammar' },
];

const FILLERS = /\b(um+|uh+|er+|erm|like,|you know|basically|actually|sort of|kind of)\b/gi;
const CONNECTORS = /\b(and|but|so|because|however|although|then|also|which|while|since|if)\b/gi;

function capitalizeSentences(text: string): string {
  return text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_m, a, b) => a + b.toUpperCase());
}

function tidy(text: string): string {
  let t = text.trim().replace(/\s+/g, ' ').replace(/\bi\b/g, 'I');
  t = capitalizeSentences(t);
  if (t && !/[.!?]$/.test(t)) t += '.';
  return t;
}

const OPENERS: Record<FeedbackTone, { good: string; ok: string; low: string }> = {
  encouraging: {
    good: 'Excellent — that sounded clear and natural!',
    ok: 'Nice effort — your meaning came across clearly.',
    low: "Good try! You're communicating — a few small fixes will make it shine.",
  },
  direct: {
    good: 'Strong answer. Only polish left.',
    ok: 'Understandable, but there are fixes to make.',
    low: 'Several errors to fix. Review the changes below.',
  },
  detailed: {
    good: 'Very strong answer overall; here is a precise breakdown.',
    ok: 'Solid base. Here is a detailed breakdown of what to adjust.',
    low: 'This needs work in a few areas. Here is a detailed breakdown.',
  },
};

export function analyzeResponse(raw: string, tone: FeedbackTone = 'encouraging'): Feedback {
  const original = raw.trim().replace(/\s+/g, ' ');
  let improved = original;
  const tips: string[] = [];
  const hits: Record<Rule['category'], number> = { grammar: 0, naturalness: 0, vocabulary: 0 };

  for (const rule of RULES) {
    rule.test.lastIndex = 0;
    if (rule.test.test(improved)) {
      rule.test.lastIndex = 0;
      improved = improved.replace(rule.test, rule.replace as never);
      tips.push(rule.tip);
      hits[rule.category] += 1;
    }
  }

  improved = tidy(improved);
  if (tidy(original) !== improved) hits.grammar += 0; // formatting only; not penalised

  const words = original.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const fillers = (original.match(FILLERS) ?? []).length;
  const connectors = (original.match(CONNECTORS) ?? []).length;
  const uniqueRatio = wordCount ? new Set(words.map((w) => w.toLowerCase())).size / wordCount : 1;
  const avgWordLen = wordCount ? words.join('').length / wordCount : 0;

  // ---- Scores (deterministic: same input → same score) ----
  const shortCap = wordCount < 4 ? 70 : wordCount < 8 ? 85 : 100;
  const grammar = clamp(Math.min(shortCap, 95 - Math.min(40, hits.grammar * 10) - (hits.naturalness ? 2 : 0)));
  const naturalness = clamp(Math.min(shortCap, 92 - hits.naturalness * 8 - hits.grammar * 4 - fillers * 3));
  const vocabulary = clamp(
    68 + Math.round((uniqueRatio - 0.6) * 40) + Math.round((avgWordLen - 4) * 6) - hits.vocabulary * 6,
  );
  const lengthScore = wordCount < 4 ? -22 : wordCount < 8 ? -10 : wordCount > 45 ? -4 : 0;
  const fluency = clamp(80 + lengthScore + Math.min(connectors, 3) * 4 - fillers * 5);

  const overall = (grammar + naturalness + vocabulary + fluency) / 4;
  const issueCount = hits.grammar + hits.naturalness + hits.vocabulary;
  const band = overall >= 85 && issueCount === 0 && wordCount >= 8 ? 'good' : overall >= 72 ? 'ok' : 'low';

  const extra: string[] = [];
  if (wordCount < 8) extra.push('Try a longer answer — add a reason or an example (use "because" or "for example").');
  if (fillers > 1) extra.push('Cut filler words like "um", "like" or "you know" — pause silently instead.');
  if (connectors === 0 && wordCount >= 8) extra.push('Link your ideas with "and", "but", "so" or "because" so it flows.');

  const body = [...tips, ...extra];
  const shown = tone === 'direct' ? body.slice(0, 2) : tone === 'detailed' ? body : body.slice(0, 3);
  const explanation =
    OPENERS[tone][band] +
    (shown.length ? ' ' + shown.join(' ') : ' No major errors found — keep this rhythm going.');

  return {
    scores: { grammar, naturalness, vocabulary, fluency },
    originalText: original,
    improvedText: improved,
    explanation,
  };
}

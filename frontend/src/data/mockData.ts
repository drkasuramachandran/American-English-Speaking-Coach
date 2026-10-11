import {
  Briefcase,
  GraduationCap,
  MessageCircle,
  UtensilsCrossed,
  Plane,
  Users,
} from 'lucide-react';
import type {
  Scenario,
  ScenarioId,
  Feedback,
  Scores,
  PracticeSession,
} from '../types';

/* -------------------------------------------------------------------------- */
/*  Scenario definitions                                                      */
/* -------------------------------------------------------------------------- */

export const scenarios: Scenario[] = [
  {
    id: 'job-interview',
    title: 'Job Interview',
    description: 'Answer common interview questions with clarity and confidence.',
    icon: Briefcase,
  },
  {
    id: 'academic-presentation',
    title: 'Academic Presentation',
    description: 'Present ideas clearly and handle follow-up questions with ease.',
    icon: GraduationCap,
  },
  {
    id: 'everyday-conversation',
    title: 'Everyday Conversation',
    description: 'Practice small talk, greetings, and casual daily chats.',
    icon: MessageCircle,
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    description: 'Order food, ask about the menu, and handle the check.',
    icon: UtensilsCrossed,
  },
  {
    id: 'airport',
    title: 'Airport',
    description: 'Check in, get through security, and navigate your travel day.',
    icon: Plane,
  },
  {
    id: 'professional-meeting',
    title: 'Professional Meeting',
    description: 'Share updates, give opinions, and align on next steps.',
    icon: Users,
  },
];

export function getScenario(id: ScenarioId | string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

export function overallScore(scores: Scores): number {
  return Math.round(
    (scores.grammar + scores.naturalness + scores.vocabulary + scores.fluency) / 4,
  );
}

/* -------------------------------------------------------------------------- */
/*  Scripted "Job Interview" conversation (fully playable, 5 turns)           */
/* -------------------------------------------------------------------------- */

export interface ScriptedTurn {
  /** The AI interviewer's question that precedes the user's answer. */
  aiQuestion: string;
  /**
   * Canned transcript inserted when the user taps "Start Speaking" then "Stop".
   * NOTE: This is the seam where a real Speech-to-Text API result would go.
   */
  demoTranscript: string;
  /** Fixed, hand-authored feedback so the demo always looks sensible. */
  feedback: Feedback;
}

export const jobInterviewScript: ScriptedTurn[] = [
  {
    aiQuestion:
      "Thanks for coming in today. To start, could you tell me a little about yourself and your background?",
    demoTranscript:
      'Sure. I am software developer with five years experience. I work mostly on web application and I like to build product that help people.',
    feedback: {
      scores: { grammar: 72, naturalness: 78, vocabulary: 80, fluency: 82 },
      originalText:
        'Sure. I am software developer with five years experience. I work mostly on web application and I like to build product that help people.',
      improvedText:
        "Sure! I'm a software developer with five years of experience. I mostly work on web applications, and I really enjoy building products that help people.",
      explanation:
        "Great start! Add the article 'a' (\"a software developer\") and 'of' (\"five years of experience\"). Contractions like \"I'm\" and plurals like \"applications\" make you sound more natural.",
    },
  },
  {
    aiQuestion: 'Nice. What made you interested in this particular role?',
    demoTranscript:
      'I interested in this role because your company work on interesting problem and I want to grow my skill in this area.',
    feedback: {
      scores: { grammar: 70, naturalness: 76, vocabulary: 79, fluency: 80 },
      originalText:
        'I interested in this role because your company work on interesting problem and I want to grow my skill in this area.',
      improvedText:
        "I'm interested in this role because your company works on really interesting problems, and I'd love to grow my skills in this area.",
      explanation:
        "Remember the verb 'am' (\"I'm interested\") and the third-person 's' (\"company works\"). \"I'd love to\" sounds warmer and more natural than \"I want to.\"",
    },
  },
  {
    aiQuestion:
      'Can you tell me about a challenging project you worked on and how you handled it?',
    demoTranscript:
      'Last year I lead a project that have a very tight deadline. It was stressful but we communicate well and we finish on time.',
    feedback: {
      scores: { grammar: 68, naturalness: 80, vocabulary: 82, fluency: 83 },
      originalText:
        'Last year I lead a project that have a very tight deadline. It was stressful but we communicate well and we finish on time.',
      improvedText:
        'Last year, I led a project with a very tight deadline. It was stressful, but we communicated well and finished on time.',
      explanation:
        "Use the past tense: \"led,\" \"communicated,\" \"finished.\" Also, \"a project with a tight deadline\" flows better than \"that have.\" Nice storytelling overall!",
    },
  },
  {
    aiQuestion: 'How do you usually handle feedback or disagreements with teammates?',
    demoTranscript:
      'I try to listen first and understand their point. Then I explain my opinion calm and we find solution together.',
    feedback: {
      scores: { grammar: 79, naturalness: 84, vocabulary: 83, fluency: 85 },
      originalText:
        'I try to listen first and understand their point. Then I explain my opinion calm and we find solution together.',
      improvedText:
        'I try to listen first and understand their point of view. Then I calmly explain my opinion, and we find a solution together.',
      explanation:
        "Use the adverb \"calmly\" instead of \"calm,\" and add \"a\" before \"solution.\" \"Point of view\" sounds more complete. This is a strong, professional answer!",
    },
  },
  {
    aiQuestion: 'Great. Finally, do you have any questions for us?',
    demoTranscript:
      'Yes, I would like to know what the team looks like and what success looks like in the first three months.',
    feedback: {
      scores: { grammar: 90, naturalness: 92, vocabulary: 88, fluency: 90 },
      originalText:
        'Yes, I would like to know what the team looks like and what success looks like in the first three months.',
      improvedText:
        "Yes — I'd love to know more about the team structure and what success looks like in the first three months.",
      explanation:
        'Almost perfect! Using "I\'d love to" and "team structure" sounds polished and confident. Excellent closing question.',
    },
  },
];

export const interviewClosingMessage =
  "That's all from my side — thanks for a great conversation. You came across as clear and confident. Head over to Progress to see how you did!";

/* -------------------------------------------------------------------------- */
/*  Non-scripted scenarios: opening question, follow-ups, demo transcripts    */
/* -------------------------------------------------------------------------- */

interface ScenarioScript {
  opening: string;
  demoTranscripts: string[]; // one per turn (opening + follow-ups)
  followUps: string[];
}

const genericFollowUps = [
  'Got it — can you tell me a bit more about that?',
  'Interesting! And how did that make you feel?',
  "Nice. Is there anything you'd do differently next time?",
];

export const scenarioScripts: Record<
  Exclude<ScenarioId, 'job-interview'>,
  ScenarioScript
> = {
  'academic-presentation': {
    opening:
      "Welcome! Let's warm up before your talk. In a sentence or two, what is your presentation about?",
    demoTranscripts: [
      'My presentation is about how renewable energy can help reduce carbon emission in cities.',
      'I collect data from three cities and I compare the result over two years.',
      'The main finding is that solar power reduce cost after the first year.',
      'Yes, I think the audience will be interested in the cost part the most.',
    ],
    followUps: genericFollowUps,
  },
  'everyday-conversation': {
    opening: "Hey! Good to see you. So, how's your day going so far?",
    demoTranscripts: [
      "It's going pretty good, thanks. I just finish my work and now I have some free time.",
      'I am thinking to go for a walk in the park later if the weather stay nice.',
      'Usually I like to grab a coffee and read a book on the weekend.',
      'Yeah, we should definitely hang out sometime soon!',
    ],
    followUps: genericFollowUps,
  },
  restaurant: {
    opening:
      'Good evening, welcome! Here are your menus. Can I start you off with something to drink?',
    demoTranscripts: [
      'Yes please, can I get a sparkling water and we need a few more minute to look the menu.',
      "I think I will have the grilled salmon. Is it come with vegetable?",
      'That sounds great. And can we also get some bread for the table?',
      'No thank you, I think that is everything. Can we have the check please?',
    ],
    followUps: [
      'Of course. Are you ready to order your main course?',
      'Excellent choice. Would you like any sides or appetizers with that?',
      'Perfect. Can I get you anything else this evening?',
    ],
  },
  airport: {
    opening:
      'Hello! May I see your passport and boarding pass, please? Where are you flying today?',
    demoTranscripts: [
      'Here you are. I am flying to New York today for a business trip.',
      'I have one luggage to check in and one small bag for carry on.',
      'Can you tell me which gate I should go and what time is boarding?',
      'Thank you so much for your help, have a nice day!',
    ],
    followUps: [
      'Thank you. Are you checking any bags, or is it carry-on only?',
      'Got it. Your gate is B12 and boarding starts at 3:40 PM. Anything else?',
      'You are all set. Enjoy your flight!',
    ],
  },
  'professional-meeting': {
    opening:
      "Alright, let's get started. Could you give us a quick update on what you've been working on?",
    demoTranscripts: [
      'Sure. This week I focus on the new dashboard and I finish most of the design already.',
      'The main blocker is that we still waiting for the data from the other team.',
      'I think we can launch by next week if everything go according to plan.',
      "Yes, I'll follow up with the team and share the notes after this meeting.",
    ],
    followUps: [
      'Thanks for the update. Are there any blockers we should know about?',
      "Understood. What's your best estimate for the timeline?",
      'Great. What are the next steps and who owns them?',
    ],
  },
};

/* -------------------------------------------------------------------------- */
/*  Sample session history + aggregate sub-scores (for the Progress screen)   */
/* -------------------------------------------------------------------------- */

export const mockSessions: PracticeSession[] = [
  { id: 's1', scenarioId: 'everyday-conversation', date: '2026-05-28', durationSeconds: 180, turnsCompleted: 4, averageScore: 74 },
  { id: 's2', scenarioId: 'job-interview', date: '2026-05-30', durationSeconds: 240, turnsCompleted: 5, averageScore: 78 },
  { id: 's3', scenarioId: 'restaurant', date: '2026-06-01', durationSeconds: 150, turnsCompleted: 3, averageScore: 80 },
  { id: 's4', scenarioId: 'airport', date: '2026-06-03', durationSeconds: 200, turnsCompleted: 4, averageScore: 83 },
  { id: 's5', scenarioId: 'professional-meeting', date: '2026-06-05', durationSeconds: 260, turnsCompleted: 5, averageScore: 85 },
  { id: 's6', scenarioId: 'academic-presentation', date: '2026-06-07', durationSeconds: 300, turnsCompleted: 5, averageScore: 88 },
  { id: 's7', scenarioId: 'job-interview', date: '2026-06-09', durationSeconds: 280, turnsCompleted: 5, averageScore: 90 },
];

export const aggregateSubScores: Pick<Scores, 'grammar' | 'fluency' | 'vocabulary'> = {
  grammar: 82,
  fluency: 86,
  vocabulary: 84,
};

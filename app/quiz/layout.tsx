import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quiz',
  description: 'Take personalized quizzes powered by AI to reinforce your learning. Track your scores, improve weak areas, and get real-time feedback.',
};

export default function QuizLayout({ children }: { children: ReactNode }) {
  return children
}

import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Access your personalized learning dashboard with progress tracking, AI companion activity, quizzes, and study insights — all in one place.',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}

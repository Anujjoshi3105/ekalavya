import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Companion',
  description: 'Experience the next generation of AI voice companions for different subjects. Personalized, real-time learning assistance powered by Ekalavya AI.',
};

export default function CompanionLayout({ children }: { children: ReactNode }) {
  return children;
}

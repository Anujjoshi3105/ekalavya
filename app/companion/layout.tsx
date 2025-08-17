import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Companion',
  description: 'AI voice companions for different subjects to assist with learning on Ekalavya.',
};

export default function CompanionLayout({ children }: { children: ReactNode }) {
  return children;
}

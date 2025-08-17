import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscription',
  description: 'Manage your subscription plan, billing details, and payment methods easily in your personalized dashboard.',
};

export default function SubscriptionLayout({ children }: { children: ReactNode }) {
    return children;
}

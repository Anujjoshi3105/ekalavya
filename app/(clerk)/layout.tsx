"use client";

import { Navbar } from "@/components/navbar";
import { ClerkProvider } from "@clerk/nextjs";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ variables: { colorPrimary: '#fe5933' }} }>
        <Navbar /> {children}
    </ClerkProvider>
  )
}

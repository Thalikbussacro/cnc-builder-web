"use client";

import { AuthProvider } from '@/contexts/AuthContext';

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}

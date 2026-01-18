"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.warn('Google OAuth Client ID not configured');
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId || ''}>
      <AuthProvider>{children}</AuthProvider>
    </GoogleOAuthProvider>
  );
}

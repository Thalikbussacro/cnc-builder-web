import NextAuth from '@/lib/auth';

// API Route do NextAuth v4 (App Router)
// Captura todas as requisicoes para /api/auth/*
const handler = NextAuth;

export { handler as GET, handler as POST };

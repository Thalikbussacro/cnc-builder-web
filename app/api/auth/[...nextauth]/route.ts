import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// API Route do NextAuth (App Router)
// Captura todas as requisicoes para /api/auth/*
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

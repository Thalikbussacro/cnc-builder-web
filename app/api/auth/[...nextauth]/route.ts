import { handlers } from '@/lib/auth';

// API Route do NextAuth v5 (App Router)
// Captura todas as requisicoes para /api/auth/*
export const { GET, POST } = handlers;

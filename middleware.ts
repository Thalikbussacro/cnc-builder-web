import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Middleware para proteger rotas
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Se estiver tentando acessar /app/* sem estar logado
  if (pathname.startsWith('/app') && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se estiver logado e tentando acessar /login ou /signup
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  return NextResponse.next();
}

// Configuracao: quais rotas o middleware protege
export const config = {
  matcher: [
    // Protege todas as rotas em /app
    '/app/:path*',
    // Redireciona usuario logado que tenta acessar login/signup
    '/login',
    '/signup',
  ],
};

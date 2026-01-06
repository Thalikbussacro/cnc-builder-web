import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Middleware para proteger rotas
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[MIDDLEWARE] Pathname:', pathname);
  console.log('[MIDDLEWARE] Cookies:', request.cookies.getAll().map(c => c.name));

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log('[MIDDLEWARE] Token encontrado:', !!token);
  if (token) {
    console.log('[MIDDLEWARE] Token user:', { email: token.email, id: token.id });
  }

  // Se estiver tentando acessar /app/* sem estar logado
  if (pathname.startsWith('/app') && !token) {
    console.log('[MIDDLEWARE] Acesso negado a /app - redirecionando para /login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se estiver logado e tentando acessar /login ou /signup
  if (token && (pathname === '/login' || pathname === '/signup')) {
    console.log('[MIDDLEWARE] Usuario logado tentando acessar', pathname, '- redirecionando para /app');
    return NextResponse.redirect(new URL('/app', request.url));
  }

  console.log('[MIDDLEWARE] Permitindo acesso a', pathname);
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

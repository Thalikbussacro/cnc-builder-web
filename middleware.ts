import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Middleware para proteger rotas
export default withAuth(
  function middleware(req) {
    // Middleware executado para rotas protegidas
    // Pode adicionar logica customizada aqui (ex: verificar roles)
    return NextResponse.next();
  },
  {
    callbacks: {
      // Determina se o usuario tem acesso a rota
      authorized: ({ token }) => {
        // Se houver token (usuario logado), autoriza
        return !!token;
      },
    },
    pages: {
      // Redireciona para login se nao autenticado
      signIn: '/login',
    },
  }
);

// Configuracao: quais rotas o middleware protege
export const config = {
  matcher: [
    // Protege todas as rotas em /app
    '/app/:path*',

    // Opcional: proteger outras rotas no futuro
    // '/admin/:path*',
    // '/settings/:path*',
  ],
};

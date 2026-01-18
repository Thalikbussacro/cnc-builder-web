import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware simplificado
 *
 * Nota: A proteção de rotas agora é feita principalmente no client-side
 * através do AuthContext, já que o token JWT é armazenado no localStorage.
 *
 * Este middleware apenas lida com redirecionamentos básicos e headers.
 */
export async function middleware(_request: NextRequest) {
  // Permite todas as requisições passarem
  // A proteção de rotas será feita no client-side pelo AuthContext
  const response = NextResponse.next();

  // Adiciona headers de segurança
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

// Configuracao: aplica a todas as rotas
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

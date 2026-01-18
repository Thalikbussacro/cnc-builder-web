"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);

  // Detecta se usuario acabou de verificar o email
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verificado com sucesso!', {
        description: 'Agora você pode fazer login na sua conta',
      });
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Google OAuth flow
      // 1. Initialize Google OAuth client
      // 2. Get ID token from Google
      // 3. Call loginWithGoogle(idToken)
      toast.error('Login com Google temporariamente indisponível', {
        description: 'Use login com email por enquanto',
      });
      setIsLoading(false);
    } catch (error) {
      console.error('[LOGIN] Erro no login Google:', error);
      toast.error('Erro ao fazer login com Google', {
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
      });
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email.toLowerCase().trim(), password);
      toast.success('Login realizado com sucesso!');
      // AuthContext já redireciona para /app
    } catch (error) {
      console.error('[LOGIN] Erro ao fazer login:', error);
      toast.error('Erro ao fazer login', {
        description: error instanceof Error ? error.message : 'Email ou senha incorretos',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Botão Google - Primário */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 text-base font-medium border-2"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {isLoading ? 'Entrando...' : 'Continuar com Google'}
      </Button>

      {/* Divisor */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou
          </span>
        </div>
      </div>

      {/* Toggle para mostrar/ocultar login com email */}
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setShowCredentials(!showCredentials)}
      >
        Continuar com Email
        {showCredentials ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-2 h-4 w-4" />
        )}
      </Button>

      {/* Form de Credentials - Colapsável */}
      {showCredentials && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="current-password"
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Entrando...' : 'Entrar com Email'}
          </Button>
        </form>
      )}
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="text-center py-4">Carregando...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}

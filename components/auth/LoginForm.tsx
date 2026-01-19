"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const { login, loginWithGoogle } = useAuth();
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

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Erro ao obter credencial do Google');
      return;
    }

    setIsLoading(true);
    try {
      // credentialResponse.credential is the ID token
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Login realizado com sucesso!');
      // AuthContext já redireciona para /app
    } catch (error) {
      console.error('[LOGIN] Erro no login Google:', error);
      toast.error('Erro ao fazer login com Google', {
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
      });
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('[LOGIN] Erro no Google OAuth');
    toast.error('Erro ao autenticar com Google', {
      description: 'Tente novamente mais tarde',
    });
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
      <div className="w-full flex justify-center">
        <div className="w-full scale-110 origin-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="continue_with"
            size="large"
            width="100%"
            theme="outline"
            shape="pill"
          />
        </div>
      </div>

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

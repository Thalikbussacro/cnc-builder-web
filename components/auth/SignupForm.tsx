"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

export function SignupForm() {
  const router = useRouter();
  const { signup, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Erro ao obter credencial do Google');
      return;
    }

    setIsLoading(true);
    try {
      // Google OAuth handles both signup and login - if user doesn't exist, backend creates account
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Conta criada/login realizado com sucesso!');
      // AuthContext já redireciona para /app
    } catch (error) {
      console.error('[SIGNUP] Erro no cadastro Google:', error);
      toast.error('Erro ao cadastrar com Google', {
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
      });
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('[SIGNUP] Erro no Google OAuth');
    toast.error('Erro ao autenticar com Google', {
      description: 'Tente novamente mais tarde',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validacoes basicas
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(email.toLowerCase().trim(), name, password);

      toast.success('Conta criada com sucesso!', {
        description: result.message || 'Verifique seu email para ativar sua conta',
      });

      // Redireciona para pagina de verificacao de email com o email como parametro
      const encodedEmail = encodeURIComponent(email.toLowerCase().trim());
      router.push(`/check-email?email=${encodedEmail}`);
    } catch (error) {
      console.error('[SIGNUP] Erro ao criar conta:', error);
      toast.error('Erro ao criar conta', {
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Botão Google - Primário */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-md">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signup_with"
            size="large"
            width="400"
            theme="filled_blue"
            shape="rectangular"
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

      {/* Toggle */}
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setShowCredentials(!showCredentials)}
      >
        Cadastrar com Email
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
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="name"
            />
          </div>

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
              autoComplete="new-password"
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Minimo 8 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Criando conta...' : 'Criar conta com Email'}
          </Button>
        </form>
      )}
    </div>
  );
}

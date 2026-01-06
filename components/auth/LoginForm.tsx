"use client";

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Detecta se usuario acabou de verificar o email
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verificado com sucesso!', {
        description: 'Agora voce pode fazer login na sua conta',
      });
      // Remove o parametro da URL
      router.replace('/login');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('[LOGIN] Iniciando login para:', email.toLowerCase().trim());

      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
        callbackUrl: '/app',
      });

      console.log('[LOGIN] Resultado do signIn:', {
        ok: result?.ok,
        error: result?.error,
        url: result?.url,
        status: result?.status,
      });

      // NextAuth com redirect: false sempre retorna ok: true
      // Precisamos verificar se ha erro explicito ou checar a sessao
      if (result?.error) {
        console.error('[LOGIN] Erro no signIn:', result.error);
        toast.error('Erro ao fazer login', {
          description: result.error,
        });
        setIsLoading(false);
        return;
      }

      if (!result?.ok) {
        console.error('[LOGIN] signIn retornou ok=false');
        toast.error('Erro ao fazer login', {
          description: 'Tente novamente',
        });
        setIsLoading(false);
        return;
      }

      // Verifica se a URL de redirect indica sucesso
      // Se retornou /app, o login foi bem-sucedido
      if (result.url?.includes('/app')) {
        console.log('[LOGIN] Login bem-sucedido, redirecionando para /app');
        toast.success('Login realizado com sucesso!');

        // Aguarda para garantir que o cookie seja salvo
        console.log('[LOGIN] Aguardando 500ms para cookie ser salvo...');
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('[LOGIN] Redirecionando para /app via window.location.href');
        // Forca reload completo para garantir que o middleware pegue o token
        window.location.href = '/app';
      } else {
        // Login falhou (URL aponta para /login)
        console.error('[LOGIN] URL de redirect nao aponta para /app:', result.url);
        toast.error('Erro ao fazer login', {
          description: 'Email ou senha incorretos',
        });
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('Erro inesperado', {
        description: 'Tente novamente mais tarde',
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="text-center py-4">Carregando...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}

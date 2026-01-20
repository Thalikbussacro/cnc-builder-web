"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error('Erro ao enviar email', {
          description: data.error || 'Tente novamente mais tarde',
        });
        return;
      }

      setEmailSent(true);
      toast.success('Email enviado!', {
        description: 'Verifique sua caixa de entrada',
      });
    } catch (error) {
      toast.error('Erro inesperado', {
        description: 'Tente novamente mais tarde',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-sm text-green-800 dark:text-green-200">
            Email enviado com sucesso!
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            Verifique sua caixa de entrada e spam
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setEmailSent(false)}
          className="w-full"
        >
          Enviar novamente
        </Button>
      </div>
    );
  }

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
        <p className="text-xs text-muted-foreground">
          Enviaremos um link para redefinir sua senha
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? 'Enviando...' : 'Enviar email de recuperacao'}
      </Button>
    </form>
  );
}

"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, AlertCircle } from 'lucide-react';

export default function CheckEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    // Se nao tem email na URL, redireciona para signup
    if (!email) {
      router.push('/signup');
    }
  }, [email, router]);

  if (!email) {
    return null; // Aguarda carregamento ou redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Icone de email */}
        <div className="flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <Mail className="h-12 w-12 text-primary" />
          </div>
        </div>

        {/* Titulo */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Verifique seu email</h1>
          <p className="text-muted-foreground">
            Enviamos um link de verificacao para
          </p>
          <p className="font-medium text-foreground">{email}</p>
        </div>

        {/* Instrucoes */}
        <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Importante
          </h2>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Clique no link que enviamos para ativar sua conta.
            </p>

            <div className="space-y-2">
              <p className="font-medium text-foreground">Nao encontrou o email?</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Verifique sua caixa de <strong>spam</strong></li>
                <li>Verifique a pasta de <strong>lixeira</strong></li>
                <li>Verifique a pasta de <strong>promocoes</strong></li>
                <li>Aguarde alguns minutos (pode demorar um pouco)</li>
              </ul>
            </div>

            <p className="text-xs pt-2 border-t">
              O link expira em <strong>24 horas</strong>
            </p>
          </div>
        </div>

        {/* Botao para ir ao login */}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/login">Ir para o Login</Link>
          </Button>

          <div className="text-center">
            <Link
              href="/signup"
              className="text-sm text-muted-foreground hover:underline"
            >
              Voltar para criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

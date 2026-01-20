import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Recuperar Senha',
  description: 'Recupere sua senha do CNC Builder',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Recuperar Senha</h1>
          <p className="text-muted-foreground">
            Digite seu email para receber o link de recuperacao
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <ForgotPasswordForm />
        </div>

        <div className="text-center text-sm">
          <Link href="/login" className="text-primary hover:underline font-medium">
            ← Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}

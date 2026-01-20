import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata = {
  title: 'Criar Conta',
  description: 'Crie sua conta no CNC Builder',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Criar Conta</h1>
          <p className="text-muted-foreground">
            Comece a gerar G-code profissional gratuitamente
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <SignupForm />
        </div>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Ja tem uma conta? </span>
          <Link href="/login" className="text-primary hover:underline font-medium">
            Fazer login
          </Link>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← Voltar para o inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

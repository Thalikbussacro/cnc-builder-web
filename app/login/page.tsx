import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login',
  description: 'Entre na sua conta do CNC Builder',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Bem-vindo de volta</h1>
          <p className="text-muted-foreground">
            Entre com sua conta para continuar
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <LoginForm />

          <div className="mt-4 text-center text-sm">
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </div>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Nao tem uma conta? </span>
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Criar conta
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

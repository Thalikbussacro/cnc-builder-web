import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export const metadata = {
  title: 'Aplicacao',
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verifica sessao no servidor (server component) - NextAuth v5
  const session = await auth();

  // Se nao tiver sessao, redireciona para login
  // (middleware ja faz isso, mas e bom ter dupla verificacao)
  if (!session) {
    redirect('/login');
  }

  // Layout da aplicacao protegida
  // O conteudo ja vem com todos os providers do root layout
  return <>{children}</>;
}

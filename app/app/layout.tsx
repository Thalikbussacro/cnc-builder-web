import { ProtectedRoute } from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Aplicação',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout da aplicação protegida
  // ProtectedRoute verifica autenticação no client-side
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

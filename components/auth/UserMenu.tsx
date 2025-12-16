"use client";

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

export function UserMenu() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: '/',
        redirect: true,
      });
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:flex flex-col items-end text-sm">
        <p className="font-medium">{session.user.name || 'Usuario'}</p>
        <p className="text-xs text-muted-foreground">
          {session.user.email}
        </p>
      </div>

      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-medium">
        {session.user.name ? (
          session.user.name.charAt(0).toUpperCase()
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" title="Sair">
            <LogOut className="h-4 w-4" />
            <span className="ml-2 hidden lg:inline">Sair</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Voce sera redirecionado para a pagina inicial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

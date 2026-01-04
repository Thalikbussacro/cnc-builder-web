import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="border-b bg-muted/50">
      <div className="container flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <div className="text-sm">
            <span className="font-medium">Modo Demonstracao</span>
            <span className="text-muted-foreground ml-2">
              Seus dados nao serao salvos permanentemente
            </span>
          </div>
        </div>

        <Button asChild size="sm">
          <Link href="/signup">Criar Conta para Salvar Projetos</Link>
        </Button>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="container py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-4xl text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Gere G-Code Profissional{' '}
          <span className="text-primary">para sua CNC</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
          Plataforma completa para gerar código G-code otimizado com algoritmo de nesting automático, validações em tempo real e preview 2D.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/signup">
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/demo">Testar sem Conta</Link>
          </Button>
        </div>

        <div className="pt-8 text-sm text-muted-foreground">
          <p>Gratuito por tempo limitado • Sem cartão de crédito</p>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Star, Check } from 'lucide-react';

export function AccountBenefits() {
  return (
    <section className="container py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Experimente Agora ou Crie sua Conta
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Escolha a melhor forma de começar a usar o CNC Builder
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
          {/* Coluna 1 - Sem Conta */}
          <div className="relative overflow-hidden rounded-lg border bg-card p-8 hover:shadow-md transition-shadow">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-3 text-2xl font-semibold">Comece Agora Mesmo</h3>
            <p className="text-muted-foreground mb-6">
              Experimente todas as funcionalidades sem necessidade de cadastro
            </p>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/demo">Testar Agora</Link>
            </Button>
          </div>

          {/* Coluna 2 - Com Conta (DESTACADO) */}
          <div className="relative overflow-hidden rounded-lg border-2 border-primary bg-card p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Badge className="absolute top-4 right-4">Recomendado</Badge>

            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Star className="h-6 w-6 text-primary" />
            </div>

            <h3 className="mb-3 text-2xl font-semibold">Crie sua Conta Grátis</h3>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  Salve suas chapas montadas
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  Recupere projetos anteriores a qualquer momento
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  Histórico completo de G-code gerado <span className="text-xs">(em breve)</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  Configurações personalizadas sempre disponíveis
                </span>
              </li>
            </ul>

            <Button asChild size="lg" className="w-full">
              <Link href="/signup">Criar Conta Grátis</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

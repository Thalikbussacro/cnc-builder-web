import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="container py-20 md:py-28">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 md:p-12 text-center space-y-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Pronto para otimizar sua produção?
        </h2>
        <p className="text-lg text-muted-foreground md:text-xl">
          Comece a gerar G-code profissional agora mesmo. Gratuito e sem burocracia.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/signup">
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/login">Já Tenho Conta</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

import { Box, Zap, Shield, Eye, Settings, Download } from 'lucide-react';

const features = [
  {
    icon: Box,
    title: 'Nesting Automático',
    description:
      'Algoritmo inteligente que otimiza o posicionamento das peças na chapa, maximizando aproveitamento de material.',
  },
  {
    icon: Zap,
    title: 'Geração Rápida',
    description:
      'Gere código G-code profissional em segundos com validações automáticas e preview em tempo real.',
  },
  {
    icon: Shield,
    title: 'Validações de Segurança',
    description:
      'Sistema completo de validação que previne erros de configuração e garante operação segura da máquina.',
  },
  {
    icon: Eye,
    title: 'Preview 2D',
    description:
      'Visualize exatamente como será o corte antes de enviar para a CNC, com métricas de aproveitamento.',
  },
  {
    icon: Settings,
    title: 'Configuração Flexível',
    description:
      'Configure parâmetros de corte, ferramenta, velocidades e profundidades de acordo com seu equipamento.',
  },
  {
    icon: Download,
    title: 'Múltiplos Formatos',
    description:
      'Exporte G-code nos formatos .tap, .nc, .gcode e .cnc, compatível com a maioria das máquinas CNC.',
  },
];

export function Features() {
  return (
    <section className="container py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Tudo que você precisa para gerar G-code
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Ferramentas profissionais para otimizar sua produção CNC
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <h3 className="font-bold text-lg">CNC Builder</h3>
            <p className="text-sm text-muted-foreground">
              Gerador profissional de G-code para fresadoras CNC
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-foreground">
                  Aplicação
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-muted-foreground hover:text-foreground">
                  Criar Conta
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground">Documentação</span>
              </li>
              <li>
                <span className="text-muted-foreground">Guias</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground">Privacidade</span>
              </li>
              <li>
                <span className="text-muted-foreground">Termos</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CNC Builder. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/icon.png"
            alt="CNC Builder"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <div className="font-bold text-xl">CNC Builder</div>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button asChild variant="ghost">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Começar Grátis</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

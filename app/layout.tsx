import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Providers } from "@/components/Providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "G-Code Generator (GCG)",
    template: "%s | G-Code Generator",
  },
  description: "Aplicação web profissional para gerar código G-Code otimizado para fresadoras CNC com algoritmo de nesting automático e validações de segurança",
  keywords: [
    "CNC",
    "G-code",
    "nesting",
    "fresadora",
    "CAM",
    "gerador g-code",
    "otimização",
    "corte CNC",
    "manufatura",
    "automação industrial"
  ],
  authors: [{ name: "CNC Builder Team" }],
  creator: "CNC Builder",
  publisher: "CNC Builder",
  applicationName: "G-Code Generator",
  openGraph: {
    title: "G-Code Generator (GCG)",
    description: "Gerador profissional de G-code com nesting automático para fresadoras CNC",
    type: "website",
    locale: "pt_BR",
    siteName: "G-Code Generator",
  },
  twitter: {
    card: "summary_large_image",
    title: "G-Code Generator (GCG)",
    description: "Gerador profissional de G-code com nesting automático",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-to-content">
          Pular para o conteúdo principal
        </a>
        <ErrorBoundary>
          <ThemeProvider defaultTheme="light" storageKey="gcg-theme">
            <Providers>
              {children}
              <Toaster />
              <OfflineIndicator />
            </Providers>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

"use client";

import { ReactNode } from "react";
import { Header } from "./Header";

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header />

      <main className="flex-1 overflow-auto bg-background">
        <div className="container mx-auto h-full p-4 max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
}

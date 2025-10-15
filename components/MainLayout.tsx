"use client";

import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const [activeSection, setActiveSection] = useState("configuracoes");

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <main className="flex-1 overflow-auto bg-background">
          <div className="h-full p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

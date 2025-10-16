"use client";

import { ReactNode } from "react";

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {children}
    </div>
  );
}

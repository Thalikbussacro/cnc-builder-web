"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-8 w-8 px-0 hover:bg-accent"
      title={theme === "light" ? "Alternar para tema escuro" : "Alternar para tema claro"}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}

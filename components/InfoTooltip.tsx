"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

type InfoTooltipProps = {
  title: string;
  content: React.ReactNode;
};

export function InfoTooltip({ title, content }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0 rounded-full hover:bg-amber-600/20 transition-colors"
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="h-3.5 w-3.5 text-amber-600/70 hover:text-amber-600 transition-colors duration-200" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-2 border-amber-600/30">
          <DialogHeader>
            <DialogTitle className="text-amber-600 dark:text-amber-500 flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Informações detalhadas sobre o parâmetro
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-foreground leading-relaxed">
            {content}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
        className="h-4 w-4 p-0 rounded-full hover:bg-accent"
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors duration-200" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">
              Informações detalhadas sobre o parâmetro
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-foreground">
            {content}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

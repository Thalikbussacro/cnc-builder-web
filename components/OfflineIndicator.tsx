"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark component as mounted (client-side only)
    setMounted(true);

    // Initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted || isOnline) return null;

  return (
    <Alert
      variant="destructive"
      className="fixed bottom-4 right-4 w-auto max-w-sm z-50 shadow-lg"
      role="alert"
      aria-live="assertive"
    >
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        Você está offline. Algumas funcionalidades estão desabilitadas.
      </AlertDescription>
    </Alert>
  );
}

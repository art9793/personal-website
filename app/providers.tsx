"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7345/ingest/c84c0792-e3a2-4b36-b107-2a948a4255a2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'858265'},body:JSON.stringify({sessionId:'858265',runId:'run1',hypothesisId:'H1',location:'app/providers.tsx:14',message:'Providers mounted on client',data:{href:window.location.href},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

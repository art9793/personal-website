import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useCallback } from "react";

// Map routes to the API data they need
const routeDataMap: Record<string, string[]> = {
  "/": ["/api/profile", "/api/projects", "/api/articles"],
  "/writing": ["/api/articles"],
  "/projects": ["/api/projects"],
  "/work": ["/api/work-experiences", "/api/profile"],
  "/travel": ["/api/travel-history"],
};

interface PrefetchLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function PrefetchLink({ href, children, className, onClick }: PrefetchLinkProps) {
  const prefetch = useCallback(() => {
    const keys = routeDataMap[href];
    if (!keys) return;

    keys.forEach((key) => {
      const existing = queryClient.getQueryData([key]);
      if (!existing) {
        queryClient.prefetchQuery({ queryKey: [key] });
      }
    });
  }, [href]);

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={prefetch}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

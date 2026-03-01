"use client";

import { ContentProvider } from "@/lib/content-context";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return <ContentProvider>{children}</ContentProvider>;
}

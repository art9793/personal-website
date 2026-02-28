"use client";

import { ContentProvider } from "@/lib/content-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ContentProvider>{children}</ContentProvider>;
}

import Layout from "@/components/layout";

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/writing", label: "Writing" },
    { href: "/projects", label: "Projects" },
    { href: "/reading", label: "Reading" },
    { href: "/work", label: "Work" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="mx-auto max-w-2xl px-6 py-12 md:py-20">
        <header className="flex items-center justify-between mb-16">
          <nav className="flex gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className={cn(
                  "relative px-3 py-1.5 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-md bg-secondary"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </header>

        <main>
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

        <footer className="mt-24 border-t pt-8 text-sm text-muted-foreground flex justify-between items-center">
          <div>
            © {new Date().getFullYear()}
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">GitHub</a>
            <a href="#" className="hover:text-primary transition-colors">Email</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

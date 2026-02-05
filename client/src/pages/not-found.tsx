import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <h1 className="text-5xl font-bold text-foreground mb-4">404</h1>
      <p className="text-lg text-muted-foreground mb-8">
        This page doesn't exist.
      </p>
      <Link
        href="/"
        className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}

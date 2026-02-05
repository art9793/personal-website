import { useMemo } from "react";
import { Link } from "wouter";
import { useArticles } from "@/lib/content-hooks";
import { format } from "date-fns";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Writing() {
  useDocumentTitle("Writing");
  const { articles } = useArticles();

  // Filter for Published status only and sort by date descending
  const publishedPosts = useMemo(() => {
    return articles
      .filter(a => a.status === "Published")
      .sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [articles]);

  const postsByYear = useMemo(() => {
    return publishedPosts.reduce((acc, post) => {
      if (!post.publishedAt) return acc;
      const year = new Date(post.publishedAt).getFullYear().toString();
      if (!acc[year]) acc[year] = [];
      acc[year].push(post);
      return acc;
    }, {} as Record<string, typeof articles>);
  }, [publishedPosts]);

  return (
    <div className="space-y-12 animate-in fade-in-50 duration-500">
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Writing</h1>
        <p className="text-muted-foreground text-lg">
          Thoughts on design, software, and building products.
        </p>
      </div>

      <div className="space-y-10">
        {Object.keys(postsByYear).length === 0 ? (
          <div className="text-muted-foreground italic">No articles published yet.</div>
        ) : (
          Object.entries(postsByYear).sort((a, b) => Number(b[0]) - Number(a[0])).map(([year, yearPosts]) => (
            <div key={year} className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase pl-1">{year}</h2>
              <div className="space-y-1">
                {yearPosts.map((post) => (
                  <Link key={post.id} href={`/article/${post.slug || post.id}`} className="block group">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-0 py-3 border-b border-border/40 group-hover:border-border transition-colors">
                      <span className="text-base font-medium text-primary group-hover:text-blue-600 transition-colors">
                        {post.title || "Untitled"}
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums sm:ml-4 font-mono flex-shrink-0">
                        {post.publishedAt ? format(new Date(post.publishedAt), "MMM dd") : ""}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

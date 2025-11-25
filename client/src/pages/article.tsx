import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function Article() {
  const [, params] = useRoute("/article/:slug");
  const slug = params?.slug;

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const response = await fetch(`/api/articles/slug/${slug}`);
      if (!response.ok) {
        throw new Error("Article not found");
      }
      return response.json();
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
        <Link href="/writing" className="text-sm text-primary hover:underline">
          ← Back to writing
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-none">
      {/* Top Bar with Breadcrumb and Date */}
      <div className="-mx-6 -mt-12 md:-mt-20 mb-12 md:mb-16 bg-muted/30 border-b">
        <div className="mx-auto max-w-3xl px-6 py-4 md:py-5">
          <div className="flex items-center justify-between gap-4 min-w-0">
            <div className="flex items-center gap-2.5 text-sm md:text-base font-medium text-muted-foreground min-w-0 flex-1">
              <Link href="/writing" className="hover:text-primary transition-colors flex-shrink-0">
                Writing
              </Link>
              <span className="text-muted-foreground/40 flex-shrink-0">/</span>
              <span className="text-foreground truncate min-w-0">{article.title}</span>
            </div>
            <div className="text-sm text-muted-foreground flex-shrink-0">
              {article.publishedAt && format(new Date(article.publishedAt), "MMM d, yyyy")}
            </div>
          </div>
        </div>
      </div>

      {/* Main Article Content */}
      <article>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-primary">
            {article.title}
          </h1>
        </div>

        {article.excerpt && (
          <p className="text-lg text-muted-foreground mb-8 font-medium">
            {article.excerpt}
          </p>
        )}

        <div 
          className="prose prose-sm sm:prose max-w-none prose-headings:text-primary prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-img:rounded-lg prose-img:border"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  );
}

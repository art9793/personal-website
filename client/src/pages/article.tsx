import { Link, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
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
        <Link href="/writing" className="inline-flex items-center text-sm text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to writing
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-none">
      <div className="mb-8">
        <Link href="/writing" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to writing
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-primary">
          {article.title}
        </h1>
        <div className="text-sm text-muted-foreground">
          {article.publishedAt && format(new Date(article.publishedAt), "MMMM d, yyyy")}
        </div>
      </div>

      {article.excerpt && (
        <p className="text-lg text-muted-foreground mb-8 font-medium">
          {article.excerpt}
        </p>
      )}

      <div 
        className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed text-primary/90"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}

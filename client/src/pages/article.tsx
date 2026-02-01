import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useRef } from "react";
import DOMPurify from "dompurify";

export default function Article() {
  const [, params] = useRoute("/article/:slug");
  const slug = params?.slug;
  const viewTracked = useRef(false);

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

  // Track view once when article loads
  useEffect(() => {
    if (article && slug && !viewTracked.current) {
      viewTracked.current = true;
      fetch(`/api/articles/${slug}/view`, { method: "POST" }).catch(() => {});
    }
  }, [article, slug]);

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
          Back to writing
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-none">
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-4 text-primary">
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
        className="prose prose-sm sm:prose max-w-none prose-headings:text-primary prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-img:rounded-lg prose-img:border"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content, { ADD_TAGS: ['iframe'], ADD_ATTR: ['target', 'rel', 'allow', 'allowfullscreen', 'frameborder'] }) }}
      />
    </article>
  );
}

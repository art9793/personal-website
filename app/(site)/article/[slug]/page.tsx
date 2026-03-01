import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { getPublishedArticleBySlug, sanitizeArticleHtml } from "../../../_lib/public-data";
import { ArticleViewTracker } from "./view-tracker";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) {
    return {
      title: "Article not found",
    };
  }
  return {
    title: article.title,
    description: article.excerpt || undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const sanitizedContent = sanitizeArticleHtml(article.content);

  return (
    <article className="max-w-none">
      <ArticleViewTracker slug={slug} />
      <div className="mb-8">
        <h1 className="text-xl md:text-3xl font-medium tracking-tight mb-4 text-gray-1100 ">{article.title}</h1>
        <div className="text-sm text-muted-foreground">
          {article.publishedAt ? format(new Date(article.publishedAt), "MMMM d, yyyy") : ""}
        </div>
      </div>

      {article.excerpt ? <p className="text-lg text-muted-foreground mb-8 font-medium">{article.excerpt}</p> : null}

      <div
        className="prose prose-sm sm:prose max-w-none prose-headings:text-gray-1100 prose-p:text-gray-1100 prose-a:text-gray-1100 prose-strong:text-gray-1100 prose-img:rounded-lg prose-img:border"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      <div className="mt-8">
        <Link href="/writing" className="inline-flex items-center text-sm text-muted-foreground hover:text-gray-1100 hover:underline">
          Back to writing
        </Link>
      </div>
    </article>
  );
}

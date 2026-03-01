import Link from "next/link";
import { format } from "date-fns";
import { PenTool } from "lucide-react";
import { formatArticleHref, getWritingData } from "../../_lib/public-data";

export const revalidate = 3600;

export const metadata = {
  title: "Writing",
};

export default async function Page() {
  const { postsByYear } = await getWritingData();
  const years = Object.entries(postsByYear).sort((a, b) => Number(b[0]) - Number(a[0]));

  return (
    <div className="space-y-12 animate-in fade-in-50 duration-300">
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-gray-1100 ">Writing</h1>
        <p className="text-muted-foreground text-lg">Thoughts on design, software, and building products.</p>
      </div>

      <div className="space-y-10">
        {years.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PenTool className="h-8 w-8 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No articles published yet.</p>
          </div>
        ) : (
          years.map(([year, yearPosts]) => (
            <div key={year} className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground tracking-wider uppercase pl-1">{year}</h2>
              <div className="space-y-1">
                {yearPosts.map((post) => (
                  <Link key={post.id} href={formatArticleHref(post)} className="block group">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-0 py-2 group-hover:opacity-70 transition-opacity">
                      <span className="text-sm md:text-base font-normal text-gray-1100 transition-colors">
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

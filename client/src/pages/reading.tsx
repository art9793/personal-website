import { Star, BookOpen } from "lucide-react";
import { useReadingList } from "@/lib/content-hooks";
import { useMemo } from "react";
import { ReadingSkeleton } from "@/components/skeletons/PageSkeletons";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Reading() {
  useDocumentTitle("Reading");
  const { readingList, isLoading } = useReadingList();

  const groupedBooks = useMemo(() => {
    return readingList.reduce((acc, item) => {
      const year = item.createdAt
        ? new Date(item.createdAt).getFullYear().toString()
        : "Other";
      if (!acc[year]) acc[year] = [];
      acc[year].push(item);
      return acc;
    }, {} as Record<string, typeof readingList>);
  }, [readingList]);

  if (isLoading) {
    return <ReadingSkeleton />;
  }

  return (
    <div className="space-y-12 animate-in fade-in-50 duration-300">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Reading</h1>
        <p className="text-muted-foreground text-lg">
          A living collection of books that have shaped my thinking.
        </p>
      </div>

      {readingList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No books added yet.</p>
        </div>
      ) : (
        <div className="relative border-l border-border ml-2 sm:ml-3 space-y-12">
          {Object.entries(groupedBooks)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([year, items]) => (
              <div key={year} className="relative pl-6 sm:pl-8">
                <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border-2 border-background bg-muted-foreground/30 ring-4 ring-background" />

                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                    {year}
                  </h2>
                </div>

                <div className="space-y-6">
                  {items.map((item) => {
                    const ratingNum = item.rating ? parseInt(item.rating, 10) : null;
                    return (
                      <div
                        key={item.id}
                        className="group flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 p-2 -mx-2 rounded-lg hover:bg-secondary/40 transition-colors"
                      >
                        <div className="flex-1">
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary group-hover:text-primary transition-colors hover:underline"
                            >
                              {item.title}
                            </a>
                          ) : (
                            <h3 className="font-medium text-primary group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                          )}
                          <p className="text-sm text-muted-foreground mt-0.5">{item.author}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          {ratingNum != null && !isNaN(ratingNum) && (
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < ratingNum ? "fill-primary text-primary" : "fill-muted/30 text-muted/30"}`}
                                />
                              ))}
                            </div>
                          )}
                          {(!ratingNum || isNaN(ratingNum)) && item.status === "Reading" && (
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                              Reading
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

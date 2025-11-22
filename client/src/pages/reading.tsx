import { Star, Book } from "lucide-react";

export default function Reading() {
  const books = [
    { title: "Creative Selection", author: "Ken Kocienda", status: "Reading", rating: null, year: "2025" },
    { title: "Build", author: "Tony Fadell", status: "Read", rating: 5, year: "2025" },
    { title: "The Design of Everyday Things", author: "Don Norman", status: "Read", rating: 5, year: "2025" },
    { title: "Shape Up", author: "Ryan Singer", status: "Read", rating: 4, year: "2024" },
    { title: "Refactoring UI", author: "Adam Wathan & Steve Schoger", status: "Read", rating: 5, year: "2024" },
    { title: "Deep Work", author: "Cal Newport", status: "Want to read", rating: null, year: "Next" },
  ];

  const groupedBooks = books.reduce((acc, book) => {
    const key = book.year;
    if (!acc[key]) acc[key] = [];
    acc[key].push(book);
    return acc;
  }, {} as Record<string, typeof books>);

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Reading</h1>
        <p className="text-muted-foreground text-lg">
          A living collection of books that have shaped my thinking.
        </p>
      </div>

      <div className="relative border-l border-border ml-2 sm:ml-3 space-y-12">
        {Object.entries(groupedBooks).sort((a, b) => b[0].localeCompare(a[0])).map(([year, books]) => (
          <div key={year} className="relative pl-6 sm:pl-8">
            <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border-2 border-background bg-muted-foreground/30 ring-4 ring-background" />
            
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">{year}</h2>
            </div>

            <div className="space-y-6">
              {books.map((book, i) => (
                <div key={i} className="group flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 p-2 -mx-2 rounded-lg hover:bg-secondary/40 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-primary group-hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{book.author}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {book.rating && (
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < book.rating! ? "fill-primary text-primary" : "fill-muted/30 text-muted/30"}`} 
                          />
                        ))}
                      </div>
                    )}
                    {!book.rating && book.status === "Reading" && (
                       <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                         Reading
                       </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

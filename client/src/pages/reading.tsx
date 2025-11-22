import { Star } from "lucide-react";

export default function Reading() {
  const books = [
    { title: "Creative Selection", author: "Ken Kocienda", status: "Reading", rating: null },
    { title: "Build", author: "Tony Fadell", status: "Read", rating: 5 },
    { title: "The Design of Everyday Things", author: "Don Norman", status: "Read", rating: 5 },
    { title: "Shape Up", author: "Ryan Singer", status: "Read", rating: 4 },
    { title: "Refactoring UI", author: "Adam Wathan & Steve Schoger", status: "Read", rating: 5 },
    { title: "Deep Work", author: "Cal Newport", status: "Want to read", rating: null },
  ];

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Reading</h1>
        <p className="text-muted-foreground text-lg">
          Books that have shaped my thinking on design and engineering.
        </p>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="divide-y">
          {books.map((book, i) => (
            <div key={i} className="p-4 sm:p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div>
                <h3 className="font-medium text-primary">{book.title}</h3>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </div>
              <div className="flex items-center gap-4">
                {book.rating && (
                   <div className="hidden sm:flex items-center gap-0.5">
                     {[...Array(5)].map((_, i) => (
                       <Star 
                         key={i} 
                         className={`h-3 w-3 ${i < book.rating! ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} 
                       />
                     ))}
                   </div>
                )}
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  book.status === "Reading" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                  book.status === "Read" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  {book.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

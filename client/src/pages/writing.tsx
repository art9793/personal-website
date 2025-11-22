import { Link } from "wouter";

export default function Writing() {
  const posts = [
    { year: "2024", title: "Designing for AI", date: "Oct 12", slug: "designing-for-ai" },
    { year: "2024", title: "The craft of software", date: "Aug 24", slug: "craft-of-software" },
    { year: "2024", title: "Building Campsite", date: "May 15", slug: "building-campsite" },
    { year: "2023", title: "Staff Design: The Book", date: "Nov 02", slug: "staff-design-book" },
    { year: "2023", title: "Why I write", date: "Jun 18", slug: "why-i-write" },
    { year: "2022", title: "On consistency", date: "Dec 10", slug: "on-consistency" },
    { year: "2022", title: "Designing Github Mobile", date: "Mar 04", slug: "designing-github-mobile" },
  ];

  const postsByYear = posts.reduce((acc, post) => {
    if (!acc[post.year]) acc[post.year] = [];
    acc[post.year].push(post);
    return acc;
  }, {} as Record<string, typeof posts>);

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Writing</h1>
        <p className="text-muted-foreground text-lg">
          Thoughts on design, software, and building products.
        </p>
      </div>

      <div className="space-y-10">
        {Object.entries(postsByYear).sort((a, b) => Number(b[0]) - Number(a[0])).map(([year, yearPosts]) => (
          <div key={year} className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase pl-1">{year}</h2>
            <div className="space-y-1">
              {yearPosts.map((post) => (
                <Link key={post.slug} href="/article/sample" className="block group">
                    <div className="flex items-baseline justify-between py-3 border-b border-border/40 group-hover:border-border transition-colors">
                      <span className="text-base font-medium text-primary group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums ml-4 font-mono">
                        {post.date}
                      </span>
                    </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

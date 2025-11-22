import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Article() {
  return (
    <article className="max-w-none">
      <div className="mb-8">
        <Link href="/writing" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to writing
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-primary">
          The craft of software
        </h1>
        <div className="text-sm text-muted-foreground">
          August 24, 2024
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed text-primary/90">
        <p className="text-lg text-muted-foreground mb-8 font-medium">
          Software is more than just code. It's about how it feels, how it responds, and the details that make it delightful.
        </p>

        <p className="mb-6">
          When we talk about "craft" in software, we often mean the intersection of visual design, interaction design, and engineering. It's the extra 10% of effort that goes into making sure the animations are smooth, the loading states are graceful, and the error messages are helpful.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Details matter</h2>
        <p className="mb-6">
          I remember working on the GitHub mobile app. We spent weeks refining the haptic feedback for the "pull to refresh" interaction. It might seem trivial, but that tiny vibration gives the user a sense of physical connection to the digital interface. It builds trust.
        </p>
        
        <p className="mb-6">
          Great software feels like a tool that has been honed and polished. It respects the user's time and attention. It doesn't shout; it assists.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">The invisible work</h2>
        <p className="mb-6">
          Much of the craft in software is invisible. It's in the performance optimizations that make the app load instantly. It's in the thoughtful empty states that guide a new user. It's in the keyboard shortcuts that make power users feel like wizards.
        </p>

        <blockquote className="pl-4 border-l-2 border-primary/20 italic my-8 text-muted-foreground">
          "Design is not just what it looks like and feels like. Design is how it works." — Steve Jobs
        </blockquote>

        <p className="mb-6">
           As we build more complex systems, maintaining this level of craft becomes harder. But it's also more important than ever. In a world of generic templates and AI-generated content, craft is what separates the good from the great.
        </p>
      </div>
      
      <div className="mt-12 pt-8 border-t">
         <h3 className="text-lg font-semibold mb-4">Thanks for reading</h3>
         <p className="text-muted-foreground mb-6">
           If you enjoyed this, you might also like my thoughts on <Link href="/article/sample" className="underline decoration-border hover:decoration-primary underline-offset-4">Designing for AI</Link>.
         </p>
      </div>
    </article>
  );
}

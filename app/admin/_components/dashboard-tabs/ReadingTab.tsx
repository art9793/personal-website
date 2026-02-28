import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Plus } from "lucide-react";

export function ReadingTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reading List</h2>
          <p className="text-muted-foreground mt-1">Books and articles you're reading.</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Book</Button>
      </div>
      <Card className="border-dashed shadow-none">
         <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
           <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
           <h3 className="text-lg font-medium">Empty reading list</h3>
           <p className="text-muted-foreground max-w-sm mt-2 mb-6">
             Keep track of books you've read or want to read.
           </p>
           <Button variant="outline">Add Book</Button>
         </CardContent>
       </Card>
    </div>
  );
}


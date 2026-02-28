import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, Upload } from "lucide-react";

export function MediaTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
          <p className="text-muted-foreground mt-1">Manage your images and files.</p>
        </div>
        <Button className="gap-2"><Upload className="h-4 w-4" /> Upload</Button>
      </div>
      <Card className="border-dashed shadow-none">
         <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
           <ImageIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
           <h3 className="text-lg font-medium">No media files</h3>
           <p className="text-muted-foreground max-w-sm mt-2 mb-6">
             Upload images and files to use in your articles and projects.
           </p>
           <Button variant="outline">Upload Files</Button>
         </CardContent>
       </Card>
    </div>
  );
}


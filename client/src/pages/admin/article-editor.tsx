import { useState, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Save, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContent } from "@/lib/content-context";
import { useToast } from "@/hooks/use-toast";
import { Editor } from "@/components/admin/editor";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function ArticleEditor() {
  const [, params] = useRoute("/admin/article/:id");
  const [, setLocation] = useLocation();
  const { articles, addArticle, updateArticle } = useContent();
  const { toast } = useToast();
  
  const articleId = params?.id === "new" ? null : params?.id ? parseInt(params.id) : null;
  const existingArticle = articleId ? articles.find(a => a.id === articleId) : null;

  const [title, setTitle] = useState(existingArticle?.title || "");
  const [content, setContent] = useState(existingArticle?.content || "");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(existingArticle?.updatedAt || null);
  const [initialContent, setInitialContent] = useState({ title: "", content: "" });

  // Update local state when article data changes
  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title);
      setContent(existingArticle.content);
      setLastSaved(existingArticle.updatedAt || null);
      setInitialContent({ title: existingArticle.title, content: existingArticle.content });
    }
  }, [existingArticle]);

  // Mark as unsaved when content changes
  useEffect(() => {
    if (title !== initialContent.title || content !== initialContent.content) {
      setSaveStatus("unsaved");
    }
  }, [title, content, initialContent]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "unsaved") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    
    try {
      if (articleId && existingArticle) {
        // Update existing article
        await updateArticle(articleId, {
          title,
          content,
        });
        const now = new Date();
        setLastSaved(now);
        setInitialContent({ title, content });
        setSaveStatus("saved");
        toast({
          title: "Draft saved",
          description: "Your changes have been saved successfully.",
        });
      } else {
        // Create new article
        const newArticle = await addArticle({
          title: title || "Untitled",
          content,
          slug: undefined, // Will be set when publishing
          author: "Admin",
          status: "Draft",
        });
        const now = new Date();
        setLastSaved(now);
        setInitialContent({ title: title || "Untitled", content });
        setSaveStatus("saved");
        toast({
          title: "Draft created",
          description: "Your article draft has been created.",
        });
        // Redirect to the new article's edit page
        setLocation(`/admin/article/${newArticle.id}`);
      }
    } catch (error) {
      setSaveStatus("unsaved");
      toast({
        title: "Error saving",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
    }
  }, [articleId, existingArticle, title, content, updateArticle, addArticle, toast, setLocation]);

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (saveStatus === "unsaved") {
      const timer = setTimeout(() => {
        handleSave();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus, handleSave]);

  const handleBack = () => {
    if (saveStatus === "unsaved") {
      if (confirm("You have unsaved changes. Do you want to leave without saving?")) {
        setLocation("/admin");
      }
    } else {
      setLocation("/admin");
    }
  };

  const wordCount = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.replace(/<[^>]*>/g, '').length;
  const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                {saveStatus === "saved" && lastSaved && (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>Saved {format(lastSaved, "h:mm a")}</span>
                  </>
                )}
                {saveStatus === "saving" && (
                  <span className="text-blue-500">Saving...</span>
                )}
                {saveStatus === "unsaved" && (
                  <span className="text-amber-500">Unsaved changes</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground mr-4">
                <span>{wordCount} words</span>
                <span>{charCount} characters</span>
                <span>{readingTime} min read</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                data-testid="button-save-draft"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveStatus === "saving" ? "Saving..." : "Save Draft"}
              </Button>

              <Button
                size="sm"
                data-testid="button-publish"
                disabled
              >
                <Eye className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title Input */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title..."
            className="text-4xl font-bold border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
            data-testid="input-article-title"
          />

          {/* Rich Text Editor */}
          <div className="min-h-[600px]">
            <Editor
              content={content}
              onChange={setContent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

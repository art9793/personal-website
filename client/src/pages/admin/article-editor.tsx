import { useState, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Save, Eye, Clock, ChevronRight, Settings, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useContent } from "@/lib/content-context";
import { useToast } from "@/hooks/use-toast";
import { Editor } from "@/components/admin/editor";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function ArticleEditor() {
  const [, params] = useRoute("/admin/article/:id");
  const [, setLocation] = useLocation();
  const { articles, addArticle, updateArticle } = useContent();
  const { toast } = useToast();
  
  const articleId = params?.id === "new" ? null : params?.id ? parseInt(params.id) : null;
  const existingArticle = articleId ? articles.find(a => a.id === articleId) : null;

  const [title, setTitle] = useState(existingArticle?.title || "");
  const [content, setContent] = useState(existingArticle?.content || "");
  const [slug, setSlug] = useState(existingArticle?.slug || "");
  const [excerpt, setExcerpt] = useState(existingArticle?.excerpt || "");
  const [tags, setTags] = useState(existingArticle?.tags || "");
  const [seoKeywords, setSeoKeywords] = useState(existingArticle?.seoKeywords || "");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(existingArticle?.updatedAt || null);
  const [initialContent, setInitialContent] = useState({ 
    title: existingArticle?.title || "", 
    content: existingArticle?.content || "", 
    slug: existingArticle?.slug || "",
    excerpt: existingArticle?.excerpt || "",
    tags: existingArticle?.tags || "",
    seoKeywords: existingArticle?.seoKeywords || ""
  });
  const [metadataOpen, setMetadataOpen] = useState(true);
  const [seoOpen, setSeoOpen] = useState(true);

  // Update local state when article data changes
  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title);
      setContent(existingArticle.content);
      setSlug(existingArticle.slug || "");
      setExcerpt(existingArticle.excerpt || "");
      setTags(existingArticle.tags || "");
      setSeoKeywords(existingArticle.seoKeywords || "");
      setLastSaved(existingArticle.updatedAt || null);
      setInitialContent({ 
        title: existingArticle.title, 
        content: existingArticle.content,
        slug: existingArticle.slug || "",
        excerpt: existingArticle.excerpt || "",
        tags: existingArticle.tags || "",
        seoKeywords: existingArticle.seoKeywords || ""
      });
    }
  }, [existingArticle]);

  // Mark as unsaved when content changes
  useEffect(() => {
    if (
      title !== initialContent.title || 
      content !== initialContent.content ||
      slug !== initialContent.slug ||
      excerpt !== initialContent.excerpt ||
      tags !== initialContent.tags ||
      seoKeywords !== initialContent.seoKeywords
    ) {
      setSaveStatus("unsaved");
    }
  }, [title, content, slug, excerpt, tags, seoKeywords, initialContent]);

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
      const articleData = {
        title,
        content,
        slug: slug || undefined,
        excerpt: excerpt || undefined,
        tags: tags || undefined,
        seoKeywords: seoKeywords || undefined,
      };

      if (articleId && existingArticle) {
        // Update existing article
        await updateArticle(articleId, articleData);
        const now = new Date();
        setLastSaved(now);
        setInitialContent({ title, content, slug, excerpt, tags, seoKeywords });
        setSaveStatus("saved");
        toast({
          title: "Draft saved",
          description: "Your changes have been saved successfully.",
        });
      } else {
        // Create new article
        const newArticle = await addArticle({
          ...articleData,
          title: title || "Untitled",
          author: "Admin",
          status: "Draft",
        });
        const now = new Date();
        setLastSaved(now);
        setInitialContent({ 
          title: title || "Untitled", 
          content, 
          slug, 
          excerpt, 
          tags, 
          seoKeywords 
        });
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
  }, [articleId, existingArticle, title, content, slug, excerpt, tags, seoKeywords, updateArticle, addArticle, toast, setLocation]);

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

      {/* Editor Content - Two Column Layout */}
      <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-4rem)]">
        {/* Main Editor Panel */}
        <ResizablePanel defaultSize={65} minSize={50}>
          <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-3xl mx-auto space-y-8">
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
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Metadata & SEO Panel */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <div className="h-full overflow-y-auto border-l bg-muted/20">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Article Settings</h2>
              </div>

              {/* Metadata Section */}
              <Collapsible open={metadataOpen} onOpenChange={setMetadataOpen}>
                <CollapsibleTrigger 
                  className="flex items-center justify-between w-full group"
                  data-testid="button-toggle-metadata"
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    <span>Metadata</span>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform",
                    metadataOpen && "rotate-90"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-xs text-muted-foreground">
                      URL Slug
                    </Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="my-article-url"
                      className="font-mono text-sm"
                      data-testid="input-article-slug"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for drafts. Set before publishing.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt" className="text-xs text-muted-foreground">
                      Excerpt
                    </Label>
                    <Textarea
                      id="excerpt"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Brief summary of your article..."
                      rows={3}
                      className="resize-none text-sm"
                      data-testid="input-article-excerpt"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-xs text-muted-foreground">
                      Tags
                    </Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="react, typescript, web"
                      className="text-sm"
                      data-testid="input-article-tags"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated tags
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* SEO Section */}
              <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
                <CollapsibleTrigger 
                  className="flex items-center justify-between w-full group"
                  data-testid="button-toggle-seo"
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Tag className="h-4 w-4" />
                    <span>SEO</span>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform",
                    seoOpen && "rotate-90"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seoKeywords" className="text-xs text-muted-foreground">
                      SEO Keywords
                    </Label>
                    <Textarea
                      id="seoKeywords"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="web development, react tutorials, programming..."
                      rows={2}
                      className="resize-none text-sm"
                      data-testid="input-article-keywords"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Publishing Section */}
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Eye className="h-4 w-4" />
                  <span>Publishing</span>
                </div>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium" data-testid="text-article-status">{existingArticle?.status || "Draft"}</span>
                  </div>
                  {existingArticle?.createdAt && (
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span data-testid="text-created-date">{format(new Date(existingArticle.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  )}
                  {existingArticle?.firstPublishedAt && (
                    <div className="flex justify-between">
                      <span>First published:</span>
                      <span data-testid="text-first-published-date">{format(new Date(existingArticle.firstPublishedAt), "MMM d, yyyy")}</span>
                    </div>
                  )}
                  {existingArticle?.lastPublishedAt && (
                    <div className="flex justify-between">
                      <span>Last published:</span>
                      <span data-testid="text-last-published-date">{format(new Date(existingArticle.lastPublishedAt), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  size="sm"
                  data-testid="button-publish-article"
                  disabled
                >
                  Publish Article
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Publishing workflow coming soon
                </p>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Eye, CheckCircle, AlertCircle, FileText, Tag, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useContent } from "@/lib/content-context";
import { useToast } from "@/hooks/use-toast";
import { Editor } from "@/components/admin/editor";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

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
  const [isPublishSheetOpen, setIsPublishSheetOpen] = useState(false);
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);
  const [initialContent, setInitialContent] = useState({ 
    title: existingArticle?.title || "", 
    content: existingArticle?.content || "", 
    slug: existingArticle?.slug || "",
    excerpt: existingArticle?.excerpt || "",
    tags: existingArticle?.tags || "",
    seoKeywords: existingArticle?.seoKeywords || ""
  });

  // Auto-generate slug from title only if not manually edited
  useEffect(() => {
    if (title && !hasManuallyEditedSlug) {
      const autoSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
      setSlug(autoSlug);
    }
  }, [title, hasManuallyEditedSlug]);

  // Track manual slug edits
  const handleSlugChange = (value: string) => {
    setSlug(value);
    setHasManuallyEditedSlug(true);
  };

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
      setHasManuallyEditedSlug(!!existingArticle.slug);
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

  const handleSaveDraft = useCallback(async () => {
    setSaveStatus("saving");
    
    try {
      if (articleId && existingArticle) {
        // Update existing article - preserve existing status and published timestamps
        const articleData = {
          title: title || "Untitled",
          content,
          slug: slug || undefined,
          excerpt: excerpt || undefined,
          tags: tags || undefined,
          seoKeywords: seoKeywords || undefined,
          // Preserve existing status and published timestamps
          status: existingArticle.status,
          publishedAt: existingArticle.publishedAt,
          firstPublishedAt: existingArticle.firstPublishedAt,
          lastPublishedAt: existingArticle.lastPublishedAt,
        };
        
        await updateArticle(articleId, articleData);
        const now = new Date();
        setLastSaved(now);
        setInitialContent({ title, content, slug, excerpt, tags, seoKeywords });
        setSaveStatus("saved");
        toast({
          title: existingArticle.status === "Published" ? "Changes saved" : "Draft saved",
          description: "Your changes have been saved successfully.",
        });
      } else {
        // Create new article as draft
        const articleData = {
          title: title || "Untitled",
          content,
          slug: slug || undefined,
          excerpt: excerpt || undefined,
          tags: tags || undefined,
          seoKeywords: seoKeywords || undefined,
          status: "Draft",
        };
        
        const newArticle = await addArticle({
          ...articleData,
          author: "Admin",
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
        handleSaveDraft();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus, handleSaveDraft]);

  const handleBack = () => {
    if (saveStatus === "unsaved") {
      if (confirm("You have unsaved changes. Do you want to leave without saving?")) {
        setLocation("/admin?tab=writing");
      }
    } else {
      setLocation("/admin?tab=writing");
    }
  };

  const handlePublish = useCallback(async () => {
    // Strip HTML to check for actual text content
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    
    // Validate required fields before publishing
    if (!title.trim()) {
      toast({
        title: "Cannot publish",
        description: "Please add a title before publishing.",
        variant: "destructive",
      });
      return;
    }

    if (!slug.trim()) {
      toast({
        title: "Cannot publish",
        description: "Please add a URL slug before publishing.",
        variant: "destructive",
      });
      return;
    }

    if (!textContent) {
      toast({
        title: "Cannot publish",
        description: "Please add some content before publishing.",
        variant: "destructive",
      });
      return;
    }

    setSaveStatus("saving");

    try {
      const now = new Date();
      const articleData = {
        title,
        content,
        slug,
        excerpt: excerpt || undefined,
        tags: tags || undefined,
        seoKeywords: seoKeywords || undefined,
        status: "Published",
        publishedAt: now,
        firstPublishedAt: existingArticle?.firstPublishedAt || now,
        lastPublishedAt: now,
      };

      if (articleId && existingArticle) {
        // Publish existing article
        await updateArticle(articleId, articleData);
        setLastSaved(now);
        setInitialContent({ title, content, slug, excerpt, tags, seoKeywords });
        setSaveStatus("saved");
        setIsPublishSheetOpen(false);
        toast({
          title: "Article published",
          description: existingArticle.status === "Published" 
            ? "Your changes have been published." 
            : "Your article is now live!",
        });
      } else {
        // Create and publish new article
        const newArticle = await addArticle({
          ...articleData,
          author: "Admin",
        });
        setLastSaved(now);
        setInitialContent({ title, content, slug, excerpt, tags, seoKeywords });
        setSaveStatus("saved");
        setIsPublishSheetOpen(false);
        toast({
          title: "Article published",
          description: "Your article is now live!",
        });
        // Redirect to the new article's edit page
        setLocation(`/admin/article/${newArticle.id}`);
      }
    } catch (error) {
      setSaveStatus("unsaved");
      toast({
        title: "Error publishing",
        description: "Failed to publish your article. Please try again.",
        variant: "destructive",
      });
    }
  }, [articleId, existingArticle, title, content, slug, excerpt, tags, seoKeywords, updateArticle, addArticle, toast, setLocation]);

  const textContent = content.replace(/<[^>]*>/g, '').trim();
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
  
  // Check for slug conflicts
  const slugConflict = useMemo(() => {
    if (!slug.trim()) return null;
    const conflictingArticle = articles.find(
      a => a.slug === slug.trim() && a.id !== articleId
    );
    return conflictingArticle || null;
  }, [slug, articles, articleId]);
  
  // Check if publish requirements are met (must have actual text content, not just HTML tags, and no slug conflicts)
  const canPublish = !!(title.trim() && slug.trim() && textContent && !slugConflict);
  
  // Generate public URL preview
  const publicUrl = useMemo(() => {
    if (!slug.trim()) return null;
    const baseUrl = window.location.origin;
    return `${baseUrl}/article/${slug.trim()}`;
  }, [slug]);
  
  // Character counts with recommendations
  const titleCharCount = title.length;
  const excerptCharCount = excerpt.length;
  const titleRecommendation = titleCharCount === 0 ? "Add a title" : 
    titleCharCount < 30 ? "Consider a longer title (30-60 chars)" :
    titleCharCount > 60 ? "Consider shortening (30-60 chars optimal)" : "Good length";
  const excerptRecommendation = excerptCharCount === 0 ? "Optional but recommended for SEO" :
    excerptCharCount < 120 ? "Add more detail (120-160 chars recommended)" :
    excerptCharCount > 160 ? "Consider shortening (120-160 chars optimal)" : "Perfect length for SEO";

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
              
              {/* Subtle auto-save indicator */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                {saveStatus === "saving" && (
                  <span className="animate-pulse">●</span>
                )}
                {saveStatus === "saved" && lastSaved && (
                  <span className="opacity-50">Auto-saved</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground mr-4">
                <span>{wordCount} words</span>
                <span>{readingTime} min read</span>
              </div>

              <Button
                size="sm"
                onClick={() => setIsPublishSheetOpen(true)}
                data-testid="button-publish"
              >
                <Eye className="h-4 w-4 mr-2" />
                {existingArticle?.status === "Published" ? "Update" : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content - Full Width */}
      <div className="h-[calc(100vh-4rem)] overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title Input */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title..."
            className="text-5xl font-bold border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
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

      {/* Publish Settings Sheet */}
      <Sheet open={isPublishSheetOpen} onOpenChange={setIsPublishSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Publish Settings</SheetTitle>
            <SheetDescription>
              Review your article metadata before publishing
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {/* Validation Checklist */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-medium">Publishing Requirements</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {title.trim() ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span className={title.trim() ? "text-foreground" : "text-muted-foreground"}>
                    Title added
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {slug.trim() ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span className={slug.trim() ? "text-foreground" : "text-muted-foreground"}>
                    URL slug set
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {textContent ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span className={textContent ? "text-foreground" : "text-muted-foreground"}>
                    Content written
                  </span>
                </div>
              </div>
              {!canPublish && (
                <p className="text-xs text-muted-foreground pt-2 border-t">
                  Complete all requirements above to publish
                </p>
              )}
            </div>

            {/* URL Preview */}
            {publicUrl && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                  <span>Public URL</span>
                </div>
                <a 
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:underline break-all"
                >
                  {publicUrl}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </div>
            )}

            {/* Metadata Fields */}
            <div className="space-y-6">
              {/* URL Slug Section */}
              <div className="space-y-3 pb-6 border-b">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slug" className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    URL Slug
                  </Label>
                  {slugConflict && (
                    <span className="text-xs text-destructive font-medium">Already in use!</span>
                  )}
                </div>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="my-article-url"
                  className={`font-mono text-sm ${slugConflict ? 'border-destructive' : ''}`}
                  data-testid="input-article-slug"
                />
                {slugConflict ? (
                  <p className="text-xs text-destructive">
                    This slug is already used by "{slugConflict.title}". Choose a different one.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from title. This creates your article's unique web address.
                  </p>
                )}
              </div>

              {/* Excerpt Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="excerpt" className="text-base">
                    Excerpt <span className="text-muted-foreground font-normal text-sm">(Recommended)</span>
                  </Label>
                  <span className={`text-xs ${excerptCharCount >= 120 && excerptCharCount <= 160 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {excerptCharCount} chars
                  </span>
                </div>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary that appears in search results and previews..."
                  rows={3}
                  className="resize-none text-sm"
                  data-testid="input-article-excerpt"
                />
                <p className="text-xs text-muted-foreground">
                  {excerptRecommendation}
                </p>
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <Label htmlFor="tags" className="text-base">
                  Tags <span className="text-muted-foreground font-normal text-sm">(Optional)</span>
                </Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="react, typescript, web development"
                  className="text-sm"
                  data-testid="input-article-tags"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated tags help readers find related content
                </p>
              </div>

              {/* SEO Keywords Section */}
              <div className="space-y-3">
                <Label htmlFor="seoKeywords" className="flex items-center gap-2 text-base">
                  <Tag className="h-4 w-4" />
                  SEO Keywords <span className="text-muted-foreground font-normal text-sm">(Optional)</span>
                </Label>
                <Textarea
                  id="seoKeywords"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="web development, react tutorials, programming tips..."
                  rows={2}
                  className="resize-none text-sm"
                  data-testid="input-article-keywords"
                />
                <p className="text-xs text-muted-foreground">
                  Keywords improve search engine discoverability
                </p>
              </div>
            </div>

            {/* Publishing Info */}
            {existingArticle && (
              <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium" data-testid="text-article-status">{existingArticle.status}</span>
                </div>
                {existingArticle.createdAt && (
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span data-testid="text-created-date">{format(new Date(existingArticle.createdAt), "MMM d, yyyy")}</span>
                  </div>
                )}
                {existingArticle.firstPublishedAt && (
                  <div className="flex justify-between">
                    <span>First published:</span>
                    <span data-testid="text-first-published-date">{format(new Date(existingArticle.firstPublishedAt), "MMM d, yyyy")}</span>
                  </div>
                )}
                {existingArticle.lastPublishedAt && (
                  <div className="flex justify-between">
                    <span>Last published:</span>
                    <span data-testid="text-last-published-date">{format(new Date(existingArticle.lastPublishedAt), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <SheetFooter className="gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                await handleSaveDraft();
                setIsPublishSheetOpen(false);
              }}
              disabled={saveStatus === "saving"}
              data-testid="button-save-draft"
            >
              Save as Draft
            </Button>
            <Button
              onClick={handlePublish}
              disabled={!canPublish || saveStatus === "saving"}
              data-testid="button-publish-article"
            >
              <Eye className="h-4 w-4 mr-2" />
              {existingArticle?.status === "Published" ? "Update Published" : "Publish Article"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";
import { useContent } from "@/lib/content-context";
import { useToast } from "@/hooks/use-toast";

export function SEOTab() {
  const { seoSettings, updateSeoSettings } = useContent();
  const { toast } = useToast();
  const [seoFormData, setSeoFormData] = useState(seoSettings);
  const [isSaving, setIsSaving] = useState(false);

  const defaultSeo = {
    siteTitle: "Portfolio",
    siteDescription: "Welcome to my portfolio",
    siteKeywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    twitterSite: "",
    twitterCreator: "",
    faviconUrl: ""
  };

  useEffect(() => {
    setSeoFormData(seoSettings || defaultSeo);
  }, [seoSettings]);

  const isDirty = useMemo(() => {
    const initial = seoSettings || defaultSeo;
    if (!seoFormData) return false;
    return Object.keys(initial).some(
      (key) => (seoFormData as any)[key] !== (initial as any)[key]
    );
  }, [seoFormData, seoSettings]);

  const handleSaveSeoSettings = async () => {
    if (!seoFormData || isSaving) return;
    setIsSaving(true);
    try {
      await updateSeoSettings(seoFormData);
      toast({ title: "SEO Settings Saved", description: "Your SEO settings have been updated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save SEO settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-3xl">
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold tracking-tight">SEO & Metadata</h2>
        <p className="text-muted-foreground mt-1">Configure site-wide SEO settings.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Site Identity</CardTitle>
          <CardDescription>Basic information about your website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-title" data-testid="label-seo-title">Site Title</Label>
            <Input 
              id="seo-title"
              data-testid="input-seo-title"
              value={seoFormData?.siteTitle || ''} 
              onChange={(e) => setSeoFormData(seoFormData ? {...seoFormData, siteTitle: e.target.value} : undefined)}
              placeholder="Your Portfolio" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-description" data-testid="label-seo-description">Site Description</Label>
            <Textarea 
              id="seo-description"
              data-testid="input-seo-description"
              value={seoFormData?.siteDescription || ''} 
              onChange={(e) => setSeoFormData(seoFormData ? {...seoFormData, siteDescription: e.target.value} : undefined)}
              placeholder="A brief description of your website"
              className="h-20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-keywords" data-testid="label-seo-keywords">Keywords (comma-separated)</Label>
            <Input 
              id="seo-keywords"
              data-testid="input-seo-keywords"
              value={seoFormData?.siteKeywords || ''} 
              onChange={(e) => setSeoFormData(seoFormData ? {...seoFormData, siteKeywords: e.target.value} : undefined)}
              placeholder="portfolio, product manager, fintech" 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open Graph (Facebook, LinkedIn)</CardTitle>
          <CardDescription>How your site appears when shared on social platforms.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="og-title" data-testid="label-og-title">OG Title</Label>
            <Input 
              id="og-title"
              data-testid="input-og-title"
              value={seoFormData?.ogTitle || ''} 
              onChange={(e) => setSeoFormData(seoFormData ? {...seoFormData, ogTitle: e.target.value} : undefined)}
              placeholder="Leave blank to use Site Title" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="og-description" data-testid="label-og-description">OG Description</Label>
            <Textarea 
              id="og-description"
              data-testid="input-og-description"
              value={seoFormData?.ogDescription || ''} 
              onChange={(e) => setSeoFormData(seoFormData ? {...seoFormData, ogDescription: e.target.value} : undefined)}
              placeholder="Leave blank to use Site Description"
              className="h-20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="og-image" data-testid="label-og-image">OG Image URL</Label>
            <Input 
              id="og-image"
              data-testid="input-og-image"
              value={seoFormData?.ogImage || ''} 
              onChange={(e) => setSeoFormData(seoFormData ? {...seoFormData, ogImage: e.target.value} : undefined)}
              placeholder="https://example.com/image.jpg" 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Twitter Card</CardTitle>
          <CardDescription>How your site appears when shared on Twitter/X.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="twitter-site" data-testid="label-twitter-site">Twitter Site Handle</Label>
            <Input 
              id="twitter-site"
              data-testid="input-twitter-site"
              value={seoFormData?.twitterSite || ''} 
              onChange={(e) => setSeoFormData(seoFormData ? {...seoFormData, twitterSite: e.target.value} : undefined)}
              placeholder="@yourhandle" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter-creator" data-testid="label-twitter-creator">Twitter Creator Handle</Label>
            <Input 
              id="twitter-creator"
              data-testid="input-twitter-creator"
              value={seoFormData?.twitterCreator || ''} 
              onChange={(e) => setSeoFormData(seoFormData ? {...seoFormData, twitterCreator: e.target.value} : undefined)}
              placeholder="@creatorhandle" 
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveSeoSettings} disabled={!isDirty || isSaving} data-testid="button-save-seo">
        {isSaving ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {isSaving ? "Saving..." : "Save SEO Settings"}
      </Button>
    </div>
  );
}


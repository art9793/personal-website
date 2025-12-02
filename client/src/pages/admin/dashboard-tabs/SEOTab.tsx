import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useContent } from "@/lib/content-context";

export function SEOTab() {
  const { seoSettings, updateSeoSettings } = useContent();
  const [seoFormData, setSeoFormData] = useState(seoSettings);

  useEffect(() => {
    setSeoFormData(seoSettings || {
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
    });
  }, [seoSettings]);

  const handleSaveSeoSettings = async () => {
    if (!seoFormData) return;
    await updateSeoSettings(seoFormData);
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

      <Button onClick={handleSaveSeoSettings} data-testid="button-save-seo">
        <Save className="h-4 w-4 mr-2" />
        Save SEO Settings
      </Button>
    </div>
  );
}


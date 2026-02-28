import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Save, Upload, Trash2, Twitter, Linkedin, Github, Mail,
  AlertCircle, CheckCircle, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContent } from "@/lib/content-context";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

export function SettingsTab() {
  const { toast } = useToast();
  const { profile, updateProfile } = useContent();

  const [formData, setFormData] = useState(profile);
  const [profileSaveStatus, setProfileSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const hasProfileChanges = formData && profile && (
    formData.name !== profile.name ||
    formData.title !== profile.title ||
    formData.bio !== profile.bio ||
    formData.email !== profile.email ||
    formData.twitter !== profile.twitter ||
    formData.linkedin !== profile.linkedin ||
    formData.github !== profile.github ||
    formData.showTwitter !== profile.showTwitter ||
    formData.showLinkedin !== profile.showLinkedin ||
    formData.showGithub !== profile.showGithub ||
    formData.showEmail !== profile.showEmail
  );

  const handleSaveProfile = async () => {
    if (!formData) return;
    setProfileSaveStatus("saving");
    try {
      await updateProfile(formData);
      setProfileSaveStatus("saved");
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
      setTimeout(() => setProfileSaveStatus("idle"), 2000);
    } catch (error) {
      setProfileSaveStatus("idle");
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAvatarUpload = async () => {
    try {
      const response = await fetch("/api/objects/upload", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await response.json();

      return {
        method: "PUT" as const,
        url: uploadURL,
        objectPath,
      };
    } catch (error) {
      console.error("Error getting upload URL:", error);
      toast({
        title: "Upload Error",
        description: "Failed to prepare image upload",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleAvatarUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    try {
      if (!result.successful || result.successful.length === 0) return;

      const uploadedFile = result.successful[0];
      const objectPath = uploadedFile.meta?.objectPath as string | undefined;

      if (!objectPath) {
        throw new Error("Object path not available - upload may have failed");
      }

      const response = await fetch("/api/profile/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ objectPath }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save avatar");
      }

      const { avatarUrl } = await response.json();

      setFormData(prev => prev ? { ...prev, avatarUrl } : undefined);

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving avatar:", error);
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : "Failed to save your profile picture",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete avatar");

      setFormData(prev => prev ? { ...prev, avatarUrl: undefined } : undefined);

      toast({
        title: "Avatar Removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error) {
      console.error("Error deleting avatar:", error);
      toast({
        title: "Delete Error",
        description: "Failed to remove your profile picture",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl space-y-4 md:space-y-12 pb-24 md:pb-0">
      <div className="hidden md:block pb-6 border-b border-border/30">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Home Page Settings</h2>
        <p className="text-muted-foreground mt-3 text-sm md:text-base">Manage your profile and home page content.</p>
      </div>

      {/* Avatar Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-1.5">Profile Picture</h3>
          <p className="text-xs md:text-sm text-muted-foreground">This image appears on your homepage</p>
        </div>
        <div className="p-6 md:p-8 lg:p-10 bg-background border border-border/30 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24 md:h-28 md:w-28 ring-2 ring-border/20 ring-offset-2 ring-offset-background">
                {formData?.avatarUrl ? (
                  <AvatarImage src={formData.avatarUrl} alt={formData.name || 'Profile'} />
                ) : null}
                <AvatarFallback className="text-xl md:text-2xl bg-muted font-semibold">{formData?.name?.substring(0, 2).toUpperCase() || 'AT'}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={5242880}
                  onGetUploadParameters={handleAvatarUpload}
                  onComplete={handleAvatarUploadComplete}
                  buttonClassName="gap-2 w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4" />
                  {formData?.avatarUrl ? 'Change Picture' : 'Upload Picture'}
                </ObjectUploader>
                {formData?.avatarUrl && (
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleDeleteAvatar}
                    className="gap-2 w-full sm:w-auto text-muted-foreground hover:text-destructive hover:border-destructive/50"
                    data-testid="button-delete-avatar"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Recommended: Square image, at least 400x400 pixels. Max file size: 5MB.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-1.5">Profile Information</h3>
          <p className="text-xs md:text-sm text-muted-foreground">Your name, title, and bio</p>
        </div>
        <div className="space-y-6 p-6 md:p-8 lg:p-10 bg-background border border-border/30 rounded-xl shadow-sm">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
            <Input
              id="name"
              value={formData?.name || ''}
              onChange={(e) => setFormData(formData ? {...formData, name: e.target.value} : undefined)}
              className="h-11 text-base transition-all border border-border/50 bg-background hover:border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="role" className="text-sm font-medium text-foreground">Job Title</Label>
            <Input
              id="role"
              value={formData?.title || ''}
              onChange={(e) => setFormData(formData ? {...formData, title: e.target.value} : undefined)}
              className="h-11 text-base transition-all border border-border/50 bg-background hover:border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
              placeholder="e.g. Product Manager, Designer"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio" className="text-sm font-medium text-foreground">Bio</Label>
              {formData?.bio && (
                <span className="text-xs text-muted-foreground">{formData.bio.length} characters</span>
              )}
            </div>
            <Textarea
              id="bio"
              value={formData?.bio || ''}
              onChange={(e) => setFormData(formData ? {...formData, bio: e.target.value} : undefined)}
              className="min-h-[140px] text-base transition-all border border-border/50 bg-background hover:border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-none leading-relaxed"
              placeholder="Tell visitors about yourself..."
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-1.5">Social Links</h3>
          <p className="text-xs md:text-sm text-muted-foreground">Connect your social profiles</p>
        </div>
        <div className="space-y-4">
          {/* Twitter */}
          <div className="group bg-background border border-border/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#1DA1F2]/10 flex items-center justify-center border border-[#1DA1F2]/20 transition-colors group-hover:border-[#1DA1F2]/40">
                    <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                  </div>
                  <Label htmlFor="show-twitter" className="text-sm font-medium text-foreground flex-shrink-0">
                    Twitter
                  </Label>
                </div>
                <Switch
                  id="show-twitter"
                  checked={formData?.showTwitter ?? true}
                  onCheckedChange={(checked) => setFormData(formData ? {...formData, showTwitter: checked} : undefined)}
                  data-testid="switch-show-twitter"
                />
              </div>
              <Input
                placeholder="https://twitter.com/username"
                value={formData?.twitter || ''}
                onChange={(e) => setFormData(formData ? {...formData, twitter: e.target.value} : undefined)}
                className="h-11 text-base transition-all border border-border/50 bg-background hover:border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                data-testid="input-twitter"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div className="group bg-background border border-border/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#0077B5]/10 flex items-center justify-center border border-[#0077B5]/20 transition-colors group-hover:border-[#0077B5]/40">
                    <Linkedin className="h-5 w-5 text-[#0077B5]" />
                  </div>
                  <Label htmlFor="show-linkedin" className="text-sm font-medium text-foreground flex-shrink-0">
                    LinkedIn
                  </Label>
                </div>
                <Switch
                  id="show-linkedin"
                  checked={formData?.showLinkedin ?? true}
                  onCheckedChange={(checked) => setFormData(formData ? {...formData, showLinkedin: checked} : undefined)}
                  data-testid="switch-show-linkedin"
                />
              </div>
              <Input
                placeholder="https://linkedin.com/in/username"
                value={formData?.linkedin || ''}
                onChange={(e) => setFormData(formData ? {...formData, linkedin: e.target.value} : undefined)}
                className="h-11 text-base transition-all border border-border/50 bg-background hover:border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                data-testid="input-linkedin"
              />
            </div>
          </div>

          {/* GitHub */}
          <div className="group bg-background border border-border/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-foreground/10 flex items-center justify-center border border-border/40 transition-colors group-hover:border-border/60">
                    <Github className="h-5 w-5 text-foreground" />
                  </div>
                  <Label htmlFor="show-github" className="text-sm font-medium text-foreground flex-shrink-0">
                    GitHub
                  </Label>
                </div>
                <Switch
                  id="show-github"
                  checked={formData?.showGithub ?? true}
                  onCheckedChange={(checked) => setFormData(formData ? {...formData, showGithub: checked} : undefined)}
                  data-testid="switch-show-github"
                />
              </div>
              <Input
                placeholder="https://github.com/username"
                value={formData?.github || ''}
                onChange={(e) => setFormData(formData ? {...formData, github: e.target.value} : undefined)}
                className="h-11 text-base transition-all border border-border/50 bg-background hover:border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                data-testid="input-github"
              />
            </div>
          </div>

          {/* Email */}
          <div className="group bg-background border border-border/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 transition-colors group-hover:border-primary/40">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <Label htmlFor="show-email" className="text-sm font-medium text-foreground flex-shrink-0">
                    Email
                  </Label>
                </div>
                <Switch
                  id="show-email"
                  checked={formData?.showEmail ?? true}
                  onCheckedChange={(checked) => setFormData(formData ? {...formData, showEmail: checked} : undefined)}
                  data-testid="switch-show-email"
                />
              </div>
              <Input
                placeholder="your.email@example.com"
                value={formData?.email || ''}
                onChange={(e) => setFormData(formData ? {...formData, email: e.target.value} : undefined)}
                className="h-11 text-base transition-all border border-border/50 bg-background hover:border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                data-testid="input-email"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6 md:pt-8 border-t border-border/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {hasProfileChanges && (
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                You have unsaved changes
              </span>
            )}
            {!hasProfileChanges && profileSaveStatus === "saved" && (
              <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                Changes saved
              </span>
            )}
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={!hasProfileChanges || profileSaveStatus === "saving"}
            size="lg"
            className="h-12 px-8 text-base font-medium shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {profileSaveStatus === "saving" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

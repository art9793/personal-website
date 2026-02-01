import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  LayoutDashboard, PenTool, FolderGit2, BookOpen, Settings, 
  LogOut, Image as ImageIcon, Save, Plus, Search, Globe,
  ChevronsLeft, ChevronsRight, Link as LinkIcon, Star,
  ChevronRight, Upload, Trash2, Edit2, ArrowLeft, Eye, CheckCircle,
  MoreHorizontal, Clock, Calendar as CalendarIcon, ArrowUpDown, Filter, Briefcase,
  Twitter, Linkedin, Github, Mail, AlertCircle, Check, Loader2, Menu, Plane, Home
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn, formatMonthYear } from "@/lib/utils";
import { Editor } from "@/components/admin/editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useContent, Article, Project, WorkExperience } from "@/lib/content-context";
import { useTravelHistory, TravelHistoryEntry } from "@/lib/content-hooks";
import { CountryCombobox } from "@/components/ui/country-combobox";
import { getCountryByCode } from "@/lib/countries";
import { ObjectUploader } from "@/components/ObjectUploader";
import { queryClient } from "@/lib/queryClient";
import type { UploadResult } from "@uppy/core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { lazy, Suspense } from "react";

// Lazy load dashboard tabs for code splitting
const OverviewTab = lazy(() => import("./dashboard-tabs/OverviewTab").then(m => ({ default: m.OverviewTab })));
const ReadingTab = lazy(() => import("./dashboard-tabs/ReadingTab").then(m => ({ default: m.ReadingTab })));
const MediaTab = lazy(() => import("./dashboard-tabs/MediaTab").then(m => ({ default: m.MediaTab })));
const SEOTab = lazy(() => import("./dashboard-tabs/SEOTab").then(m => ({ default: m.SEOTab })));

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Read initial tab from URL search params
  const initialTab = (() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    return tab && ["overview", "writing", "projects", "work", "travel", "reading", "media", "seo", "settings"].includes(tab) 
      ? tab 
      : "overview";
  })();
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [articleStatusFilter, setArticleStatusFilter] = useState<"all" | "draft" | "published">("all");
  
  // Helper to change tab and update URL (preserves browser history)
  const changeTab = useCallback((tab: string) => {
    setActiveTab(tab);
    // Update URL with query params without full navigation
    const newUrl = `/admin?tab=${tab}`;
    window.history.pushState({}, '', newUrl);
  }, []);
  
  // Sync activeTab with URL when browser back/forward buttons are used
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["overview", "writing", "projects", "work", "travel", "reading", "media", "seo", "settings"].includes(tab)) {
        setActiveTab(tab);
      } else {
        setActiveTab("overview");
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const { 
    profile, seoSettings, articles, projects, workHistory,
    updateProfile, updateSeoSettings, addArticle, updateArticle, deleteArticle,
    addProject, updateProject, deleteProject,
    addWork, updateWork, deleteWork
  } = useContent();
  
  const {
    travelHistory,
    isLoading: isTravelLoading,
    addTravelHistory,
    updateTravelHistory,
    deleteTravelHistory
  } = useTravelHistory();
  
  const [formData, setFormData] = useState(profile);
  const [seoFormData, setSeoFormData] = useState(seoSettings);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingWork, setEditingWork] = useState<WorkExperience | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProjectSheetOpen, setIsProjectSheetOpen] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isWorkSheetOpen, setIsWorkSheetOpen] = useState(false);
  const [isSavingWork, setIsSavingWork] = useState(false);
  const [isTravelSheetOpen, setIsTravelSheetOpen] = useState(false);
  const [isSavingTravel, setIsSavingTravel] = useState(false);
  const [editingTravel, setEditingTravel] = useState<{
    id?: number;
    countryCode: string;
    countryName: string;
    continent: string;
    visitDate: string;
    notes: string;
    isHomeCountry: boolean;
  } | null>(null);
  const [profileSaveStatus, setProfileSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const isMobile = useIsMobile();
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof Article | keyof Project | keyof WorkExperience; direction: 'asc' | 'desc' } | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  // Check if profile form has changes
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

  // Reset states when changing tabs
  useEffect(() => {
    if (activeTab !== 'writing') {
      setIsWriting(false);
      setEditingArticle(null);
    }
    if (activeTab !== 'projects') {
      setIsProjectSheetOpen(false);
      setEditingProject(null);
    }
    if (activeTab !== 'work') {
      setIsWorkSheetOpen(false);
      setEditingWork(null);
    }
    if (activeTab !== 'travel') {
      setIsTravelSheetOpen(false);
      setEditingTravel(null);
    }
    // Reset sort and filter
    setSortConfig(null);
    setFilterQuery("");
  }, [activeTab]);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

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

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
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

  const handleSaveSeoSettings = async () => {
    if (!seoFormData) return;
    await updateSeoSettings(seoFormData);
  };

  const handleNewPost = () => {
    setLocation("/admin/article/new");
  };

  const handleEditPost = (article: Article) => {
    setLocation(`/admin/article/${article.id}`);
  };

  const autoSaveArticle = useCallback(async (article: Article) => {
    if (!article) return;
    
    try {
      setSaveStatus("saving");
      if (article.id) {
        // Update existing article (trust the ID presence, don't rely on cache)
        await updateArticle(article.id, article);
      } else {
        // For new articles, create and capture the ID
        const createdArticle = await addArticle(article);
        if (createdArticle && createdArticle.id) {
          // Update editing state with the newly created article's ID
          setEditingArticle(prev => prev ? { ...prev, id: createdArticle.id } : null);
        }
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error auto-saving article:", error);
      setSaveStatus("idle");
      toast({
        title: "Auto-save Failed",
        description: "There was a problem saving your changes.",
        variant: "destructive"
      });
    }
  }, [updateArticle, addArticle, toast]);

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!editingArticle || !isWriting) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (2 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      autoSaveArticle(editingArticle);
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editingArticle, isWriting, autoSaveArticle]);

  const handleSaveArticle = async () => {
    if (!editingArticle) return;

    try {
      setSaveStatus("saving");
      if (editingArticle.id) {
        await updateArticle(editingArticle.id, editingArticle);
      } else {
        await addArticle(editingArticle);
      }

      toast({
        title: "Article Saved",
        description: `"${editingArticle.title || 'Untitled'}" has been saved successfully.`,
      });
      setSaveStatus("saved");
      setIsWriting(false);
      setEditingArticle(null);
    } catch (error) {
      console.error("Error saving article:", error);
      setSaveStatus("idle");
    }
  };

  const handleDeleteArticle = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this article?")) {
      try {
        await deleteArticle(id);
        toast({
          title: "Article Deleted",
          description: "The article has been permanently removed.",
          variant: "destructive"
        });
      } catch (error) {
        console.error("Error deleting article:", error);
      }
    }
  };

  const canPublishArticle = (article: Article | null) => {
    if (!article) return false;
    return article.slug?.trim() !== '' && article.title?.trim() !== '';
  };

  const toggleArticleStatus = async (article: Article) => {
    if (article.status === "Draft" && !canPublishArticle(article)) {
      toast({
        title: "Cannot Publish",
        description: "Article must have a title and slug before publishing.",
        variant: "destructive"
      });
      return;
    }

    const newStatus = article.status === "Published" ? "Draft" : "Published";
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0d8ac7f-fc1b-4040-89a7-71b54e0c5c30',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:toggleArticleStatus:before',message:'Before updateArticle call',data:{articleId:article.id,oldStatus:article.status,newStatus},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      await updateArticle(article.id, { status: newStatus });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0d8ac7f-fc1b-4040-89a7-71b54e0c5c30',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:toggleArticleStatus:after',message:'After updateArticle resolved',data:{articleId:article.id,newStatus,articlesLength:articles.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      toast({
        title: `Article ${newStatus}`,
        description: `"${article.title}" is now ${newStatus.toLowerCase()}.`,
      });
    } catch (error) {
      console.error("Error updating article status:", error);
      toast({
        title: "Error",
        description: "Failed to update article status.",
        variant: "destructive"
      });
    }
  };

  const handleSaveProject = async () => {
    if (!editingProject || isSavingProject) return;

    setIsSavingProject(true);
    try {
      if (editingProject.id && projects.some(p => p.id === editingProject.id)) {
        await updateProject(editingProject.id, editingProject);
      } else {
        await addProject(editingProject);
      }

      toast({
        title: "Project Saved",
        description: `"${editingProject.title || 'Untitled'}" has been saved successfully.`,
      });
      setIsProjectSheetOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: "Failed to save project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleNewProject = () => {
    const newProject: Partial<Project> = {
      title: "",
      description: "",
      link: "",
      tags: "",
      status: "Active",
      featured: false
    };
    setEditingProject(newProject as Project);
    setIsProjectSheetOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectSheetOpen(true);
  };

  const handleDeleteProject = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject(id);
      toast({
        title: "Project Deleted",
        description: "The project has been permanently removed.",
        variant: "destructive"
      });
    }
  };

  const handleNewWork = () => {
    const newWork: Partial<WorkExperience> = {
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
      logo: ""
    };
    setEditingWork(newWork as WorkExperience);
    setIsWorkSheetOpen(true);
  };

  const handleEditWork = (work: WorkExperience) => {
    setEditingWork(work);
    setIsWorkSheetOpen(true);
  };

  const handleSaveWork = async () => {
    if (!editingWork || isSavingWork) return;

    // Validation
    if (!editingWork.company?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a company name.",
        variant: "destructive"
      });
      return;
    }

    if (!editingWork.role?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a role title.",
        variant: "destructive"
      });
      return;
    }

    if (!editingWork.startDate) {
      toast({
        title: "Validation Error",
        description: "Please select a start date.",
        variant: "destructive"
      });
      return;
    }

    // Require either "Present" or an actual end date - no ambiguous empty state
    if (!editingWork.endDate || (editingWork.endDate !== "Present" && !editingWork.endDate.trim())) {
      toast({
        title: "Validation Error",
        description: "Please either check 'I currently work here' or select an end date.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingWork(true);
    try {
      if (editingWork.id && workHistory.some(w => w.id === editingWork.id)) {
        await updateWork(editingWork.id, editingWork);
      } else {
        await addWork(editingWork);
      }

      toast({
        title: "Work Experience Saved",
        description: `"${editingWork.company}" has been saved successfully.`,
      });
      setIsWorkSheetOpen(false);
      setEditingWork(null);
    } catch (error) {
      console.error("Error saving work experience:", error);
      toast({
        title: "Error",
        description: "Failed to save work experience. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingWork(false);
    }
  };

  const handleDeleteWork = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this work experience?")) {
      await deleteWork(id);
      toast({
        title: "Work Experience Deleted",
        description: "The entry has been permanently removed.",
        variant: "destructive"
      });
    }
  };

  // Travel handlers
  const handleNewTravel = () => {
    setEditingTravel({
      countryCode: "",
      countryName: "",
      continent: "",
      visitDate: "",
      notes: "",
      isHomeCountry: false
    });
    setIsTravelSheetOpen(true);
  };

  const handleEditTravel = (entry: TravelHistoryEntry) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0d8ac7f-fc1b-4040-89a7-71b54e0c5c30',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:handleEditTravel',message:'Edit travel called',data:{entryId:entry.id,countryCode:entry.countryCode},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    const country = getCountryByCode(entry.countryCode);
    setEditingTravel({
      id: entry.id,
      countryCode: entry.countryCode,
      countryName: entry.countryName,
      continent: country?.continent || "",
      visitDate: entry.visitDate || "",
      notes: entry.notes || "",
      isHomeCountry: entry.isHomeCountry || false
    });
    setIsTravelSheetOpen(true);
  };

  const handleSaveTravel = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0d8ac7f-fc1b-4040-89a7-71b54e0c5c30',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:handleSaveTravel:start',message:'handleSaveTravel called',data:{editingTravel},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    if (!editingTravel || isSavingTravel) return;

    // Validation
    if (!editingTravel.countryCode) {
      toast({
        title: "Validation Error",
        description: "Please select a country.",
        variant: "destructive"
      });
      return;
    }

    if (!editingTravel.isHomeCountry && !editingTravel.visitDate) {
      toast({
        title: "Validation Error",
        description: "Please select a visit date or mark as home country.",
        variant: "destructive"
      });
      return;
    }

    // Convert visitDate from "YYYY-MM-DD" to "YYYY-MM" format (schema expects max 7 chars)
    const visitDateFormatted = editingTravel.visitDate 
      ? editingTravel.visitDate.substring(0, 7) // "YYYY-MM-DD" -> "YYYY-MM"
      : undefined;
    
    const data = {
      countryCode: editingTravel.countryCode,
      countryName: editingTravel.countryName,
      visitDate: editingTravel.isHomeCountry ? undefined : visitDateFormatted,
      notes: editingTravel.notes || undefined,
      isHomeCountry: editingTravel.isHomeCountry
    };

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0d8ac7f-fc1b-4040-89a7-71b54e0c5c30',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:handleSaveTravel:beforeAPI',message:'About to call API',data:{data,isUpdate:!!editingTravel.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
    // #endregion

    setIsSavingTravel(true);
    try {
      if (editingTravel.id) {
        await updateTravelHistory(editingTravel.id, data);
      } else {
        await addTravelHistory(data);
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0d8ac7f-fc1b-4040-89a7-71b54e0c5c30',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:handleSaveTravel:success',message:'API call succeeded',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
      // #endregion

      toast({
        title: editingTravel.id ? "Visit Updated" : "Visit Added",
        description: `${editingTravel.countryName} has been saved successfully.`,
      });
      setIsTravelSheetOpen(false);
      setEditingTravel(null);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0d8ac7f-fc1b-4040-89a7-71b54e0c5c30',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:handleSaveTravel:error',message:'API call failed',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      console.error("Error saving travel entry:", error);
      toast({
        title: "Error",
        description: "Failed to save travel entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingTravel(false);
    }
  };

  const handleDeleteTravel = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0d8ac7f-fc1b-4040-89a7-71b54e0c5c30',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:handleDeleteTravel',message:'Delete travel called',data:{id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    if (confirm("Are you sure you want to delete this travel entry?")) {
      try {
        await deleteTravelHistory(id);
        toast({
          title: "Travel Entry Deleted",
          description: "The entry has been permanently removed.",
          variant: "destructive"
        });
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0d8ac7f-fc1b-4040-89a7-71b54e0c5c30',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:handleDeleteTravel:error',message:'Delete failed',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
        toast({
          title: "Error",
          description: "Failed to delete travel entry.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      result = result.filter(project => 
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        (project.tags && project.tags.toLowerCase().includes(query))
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key] || "";
        const bValue = (b as any)[sortConfig.key] || "";
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [projects, filterQuery, sortConfig]);

  const filteredArticles = useMemo(() => {
    // #region agent log
    const articleStatuses = articles.slice(0, 5).map(a => ({ id: a.id, status: a.status }));
    fetch('http://127.0.0.1:7242/ingest/a0d8ac7f-fc1b-4040-89a7-71b54e0c5c30',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:filteredArticles:memo',message:'Computing filteredArticles',data:{articlesCount:articles.length,sampleStatuses:articleStatuses},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    let result = [...articles];

    // Filter by status
    if (articleStatusFilter === "draft") {
      result = result.filter(article => article.status === "Draft");
    } else if (articleStatusFilter === "published") {
      result = result.filter(article => article.status === "Published");
    }

    // Filter by search query
    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      result = result.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        (article.tags && article.tags.toLowerCase().includes(query)) ||
        (article.seoKeywords && article.seoKeywords.toLowerCase().includes(query))
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key] || "";
        const bValue = (b as any)[sortConfig.key] || "";
        
        // Special handling for numbers (views)
        if (sortConfig.key === 'views') {
             const aNum = parseInt(aValue.toString().replace(/[^0-9]/g, '')) || 0;
             const bNum = parseInt(bValue.toString().replace(/[^0-9]/g, '')) || 0;
             return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [articles, articleStatusFilter, filterQuery, sortConfig]);

  const filteredWork = useMemo(() => {
    let result = [...workHistory];

    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      result = result.filter(work => 
        work.company.toLowerCase().includes(query) ||
        work.role.toLowerCase().includes(query) ||
        work.description.toLowerCase().includes(query)
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key] || "";
        const bValue = (b as any)[sortConfig.key] || "";
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [workHistory, filterQuery, sortConfig]);

  // Group travel history by country for display (combine visits to same country)
  const groupedTravelHistory = useMemo(() => {
    const grouped = travelHistory.reduce((acc, entry) => {
      const key = entry.countryCode;
      if (!acc[key]) {
        acc[key] = {
          countryCode: entry.countryCode,
          countryName: entry.countryName,
          visits: [],
          isHomeCountry: entry.isHomeCountry || false,
          entries: []
        };
      }
      if (entry.visitDate) {
        acc[key].visits.push(entry.visitDate);
      }
      acc[key].entries.push(entry);
      return acc;
    }, {} as Record<string, { countryCode: string; countryName: string; visits: string[]; isHomeCountry: boolean; entries: TravelHistoryEntry[] }>);

    return Object.values(grouped).sort((a, b) => {
      // Home country first
      if (a.isHomeCountry && !b.isHomeCountry) return -1;
      if (!a.isHomeCountry && b.isHomeCountry) return 1;
      // Then by most recent visit
      const aDate = a.visits.sort().reverse()[0] || "";
      const bDate = b.visits.sort().reverse()[0] || "";
      return bDate.localeCompare(aDate);
    });
  }, [travelHistory]);

  const filteredTravel = useMemo(() => {
    let result = [...travelHistory];

    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      result = result.filter(entry => 
        entry.countryName.toLowerCase().includes(query) ||
        entry.countryCode.toLowerCase().includes(query) ||
        (entry.notes && entry.notes.toLowerCase().includes(query))
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key] || "";
        const bValue = (b as any)[sortConfig.key] || "";
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Default sort: home country first, then by visit date (newest first)
    if (!sortConfig) {
      result.sort((a, b) => {
        if (a.isHomeCountry && !b.isHomeCountry) return -1;
        if (!a.isHomeCountry && b.isHomeCountry) return 1;
        const aDate = a.visitDate || "";
        const bDate = b.visitDate || "";
        return bDate.localeCompare(aDate);
      });
    }

    return result;
  }, [travelHistory, filterQuery, sortConfig]);

  // Memoize article counts
  const draftArticlesCount = useMemo(() => 
    articles.filter(a => a.status === "Draft").length, 
    [articles]
  );
  const publishedArticlesCount = useMemo(() => 
    articles.filter(a => a.status === "Published").length, 
    [articles]
  );

  const SidebarItem = ({ icon: Icon, label, id }: { icon: any, label: string, id: string }) => {
    const handleClick = () => {
      changeTab(id);
      if (isMobile) {
        setIsMobileSidebarOpen(false);
      }
    };

    if (!isSidebarExpanded && !isMobile) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className={cn(
                "w-full flex items-center justify-center p-2 rounded-md transition-colors",
                activeTab === id 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="sr-only">{label}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      );
    }
    
    return (
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
          activeTab === id 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    );
  };

  const getWordCount = (content: string) => {
    const text = content.replace(/<[^>]*>?/gm, ''); 
    const noOfWords = text.split(/\s+/).filter(Boolean).length;
    return noOfWords;
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = getWordCount(content);
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Sidebar content component (reusable for desktop and mobile)
  const SidebarContent = () => (
    <>
      <div className={cn(
        "bg-background/50 backdrop-blur transition-all",
        isSidebarExpanded && !isMobile ? "p-6 border-b" : isMobile ? "p-6 border-b" : "p-4 border-b-0"
      )}>
        {isSidebarExpanded || isMobile ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden flex-1">
              <div className="h-8 w-8 rounded-lg bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold">
                {profile?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{profile?.name || 'Admin'}</div>
                <div className="text-xs text-muted-foreground truncate">Admin</div>
              </div>
            </div>
            {!isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:bg-secondary flex-shrink-0"
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              {profile?.name?.charAt(0) || 'A'}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground hover:bg-secondary"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className={cn(
        "flex-1 overflow-y-auto space-y-6",
        (isSidebarExpanded || isMobile) ? "py-6 px-3" : "py-6 px-2"
      )}>
        <div className="space-y-1">
          {(isSidebarExpanded || isMobile) && (
            <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Content</h4>
          )}
          <SidebarItem icon={LayoutDashboard} label="Overview" id="overview" />
          <SidebarItem icon={Settings} label="Home Page" id="settings" />
          <SidebarItem icon={PenTool} label="Writing" id="writing" />
          <SidebarItem icon={FolderGit2} label="Projects" id="projects" />
          <SidebarItem icon={Briefcase} label="Work History" id="work" />
          <SidebarItem icon={Plane} label="Travel" id="travel" />
          <SidebarItem icon={BookOpen} label="Reading List" id="reading" />
        </div>

        <div className="space-y-1">
           {(isSidebarExpanded || isMobile) && (
             <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">System</h4>
           )}
           <SidebarItem icon={ImageIcon} label="Media Library" id="media" />
           <SidebarItem icon={Globe} label="SEO & Metadata" id="seo" />
        </div>
      </div>

      <div className={cn(
        "p-4 border-t bg-background/50 backdrop-blur flex items-center gap-2",
        (isSidebarExpanded || isMobile) ? "justify-between" : "flex-col justify-center"
      )}>
        <Button 
          variant="ghost" 
          onClick={handleSignOut} 
          className={cn(
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            (isSidebarExpanded || isMobile) ? "flex-1 justify-start gap-2" : "w-full justify-center px-0"
          )}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
          {(isSidebarExpanded || isMobile) && "Sign Out"}
        </Button>
        <div className={cn((isSidebarExpanded || isMobile) ? "flex-shrink-0" : "")}>
          <ThemeToggle />
        </div>
      </div>
    </>
  );

  // Get tab title for mobile header
  const getTabTitle = () => {
    const titles: Record<string, string> = {
      overview: "Overview",
      settings: "Home Page",
      writing: "Writing",
      projects: "Projects",
      work: "Work History",
      travel: "Travel",
      reading: "Reading List",
      media: "Media Library",
      seo: "SEO & Metadata"
    };
    return titles[activeTab] || "Dashboard";
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="h-8 w-8"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-sm font-semibold">{getTabTitle()}</h1>
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
          {profile?.name?.charAt(0) || 'A'}
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex flex-col h-full bg-muted/30">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex border-r bg-muted/30 flex-col transition-all duration-300 ease-in-out group relative",
        isSidebarExpanded ? "w-64" : "w-[72px]"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background pt-14 md:pt-0">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-4 md:space-y-8">
          {activeTab === "overview" && (
            <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
              <OverviewTab
                profileName={profile?.name}
                articlesCount={articles.length}
                draftArticlesCount={draftArticlesCount}
                projectsCount={projects.length}
                onChangeTab={changeTab}
                onNewPost={handleNewPost}
              />
            </Suspense>
          )}

          {activeTab === "projects" && (
            <div className="space-y-4 animate-in fade-in-50 duration-500">
              <div className="hidden md:block mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Filter projects..." 
                        className="pl-8 h-9 text-sm" 
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                    />
                </div>
                <Sheet open={isProjectSheetOpen} onOpenChange={(open) => {
                    setIsProjectSheetOpen(open);
                    if (!open) setEditingProject(null);
                }}>
                    <SheetTrigger asChild>
                        <Button onClick={handleNewProject} size="sm" className="gap-2 h-9 shadow-none w-full md:w-auto"><Plus className="h-4 w-4" /> Add Project</Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                            <SheetHeader className="mb-6">
                                <SheetTitle>{editingProject?.title ? 'Edit Project' : 'New Project'}</SheetTitle>
                                <SheetDescription>
                                    Add or edit project details to showcase in your portfolio.
                                </SheetDescription>
                            </SheetHeader>
                            {editingProject && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Project Title</Label>
                                        <Input 
                                            id="title" 
                                            value={editingProject.title} 
                                            onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                                            placeholder="e.g. Campsite"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea 
                                            id="description" 
                                            value={editingProject.description} 
                                            onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                                            placeholder="Brief description of the project..."
                                            className="min-h-[100px]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="link">Project Link</Label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="link" 
                                                className="pl-8"
                                                value={editingProject.link} 
                                                onChange={(e) => setEditingProject({...editingProject, link: e.target.value})}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Tags</Label>
                                        <Input 
                                            id="tags" 
                                            value={editingProject.tags} 
                                            onChange={(e) => setEditingProject({...editingProject, tags: e.target.value})}
                                            placeholder="e.g. Design, React, Mobile (comma separated)"
                                        />
                                        <p className="text-xs text-muted-foreground">Comma separated tags for filtering</p>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Featured Project</Label>
                                                <p className="text-sm text-muted-foreground">Pin this project to the top of your list</p>
                                            </div>
                                            <Switch 
                                                checked={editingProject.featured}
                                                onCheckedChange={(checked) => setEditingProject({...editingProject, featured: checked})}
                                            />
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Active Status</Label>
                                                <p className="text-sm text-muted-foreground">Show this project publicly</p>
                                            </div>
                                            <Switch 
                                                checked={editingProject.status === "Active"}
                                                onCheckedChange={(checked) => setEditingProject({...editingProject, status: checked ? "Active" : "Archived"})}
                                            />
                                        </div>
                                    </div>

                                    <SheetFooter className="pt-6">
                                        <SheetClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </SheetClose>
                                        <Button onClick={handleSaveProject} disabled={isSavingProject || !editingProject?.title?.trim()}>
                                            {isSavingProject ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : 'Save Project'}
                                        </Button>
                                    </SheetFooter>
                                </div>
                            )}
                        </SheetContent>
                    </Sheet>
              </div>

              <div className="border rounded-md bg-background overflow-hidden min-w-0">
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-[300px] cursor-pointer hover:text-foreground" onClick={() => handleSort('title')}>
                                <div className="flex items-center gap-1">
                                    Title {sortConfig?.key === 'title' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('description')}>
                                <div className="flex items-center gap-1">
                                    Description {sortConfig?.key === 'description' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('tags')}>
                                <div className="flex items-center gap-1">
                                    Tags {sortConfig?.key === 'tags' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="w-[100px] text-center cursor-pointer hover:text-foreground" onClick={() => handleSort('featured')}>
                                <div className="flex items-center justify-center gap-1">
                                    Featured {sortConfig?.key === 'featured' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="w-[100px] text-center cursor-pointer hover:text-foreground" onClick={() => handleSort('status')}>
                                <div className="flex items-center justify-center gap-1">
                                    Status {sortConfig?.key === 'status' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No projects found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProjects.map((project) => (
                                <TableRow 
                                    key={project.id} 
                                    className="group cursor-pointer hover:bg-muted/30"
                                    onClick={() => handleEditProject(project)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                                <FolderGit2 className="h-4 w-4" />
                                            </div>
                                            <span className="truncate max-w-[200px] font-semibold">{project.title || "Untitled"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                                        {project.description || "—"}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {project.tags ? (
                                            <div className="flex gap-1 flex-wrap">
                                                {project.tags.split(',').slice(0, 2).map((tag, i) => (
                                                    <Badge key={i} variant="secondary" className="text-[10px] font-normal h-5">
                                                        {tag.trim()}
                                                    </Badge>
                                                ))}
                                                {project.tags.split(',').length > 2 && (
                                                    <Badge variant="secondary" className="text-[10px] font-normal h-5">+{project.tags.split(',').length - 2}</Badge>
                                                )}
                                            </div>
                                        ) : "—"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {project.featured ? (
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mx-auto" />
                                        ) : (
                                            <Star className="h-4 w-4 text-muted-foreground/20 mx-auto" />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                        <Switch 
                                            checked={project.status === "Active"}
                                            onCheckedChange={async (checked) => {
                                                try {
                                                    await updateProject(project.id, { status: checked ? "Active" : "Archived" });
                                                    toast({
                                                        title: `Project ${checked ? 'Activated' : 'Archived'}`,
                                                        description: `"${project.title}" is now ${checked ? 'active' : 'archived'}.`,
                                                    });
                                                } catch (error) {
                                                    console.error("Error updating project status:", error);
                                                    toast({
                                                        title: "Error",
                                                        description: "Failed to update project status.",
                                                        variant: "destructive"
                                                    });
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditProject(project); }}>
                                                    <Edit2 className="mr-2 h-3 w-3" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteProject(project.id, e)}>
                                                    <Trash2 className="mr-2 h-3 w-3" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "writing" && !isWriting && (
            <div className="space-y-4 animate-in fade-in-50 duration-500">
              <div className="hidden md:block mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Writing</h2>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Filter by tags or keywords..." 
                        className="pl-8 h-9 text-sm" 
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                    />
                </div>
                <Button onClick={() => setLocation("/admin/article/new")} size="sm" className="gap-2 h-9 shadow-none w-full md:w-auto"><Plus className="h-4 w-4" /> New Article</Button>
              </div>

              {/* Article Status Filter Tabs */}
              <Tabs value={articleStatusFilter} onValueChange={(value) => setArticleStatusFilter(value as "all" | "draft" | "published")} className="mb-4">
                <TabsList>
                  <TabsTrigger value="all" data-testid="tab-all-articles">
                    All ({articles.length})
                  </TabsTrigger>
                  <TabsTrigger value="draft" data-testid="tab-draft-articles">
                    Drafts ({draftArticlesCount})
                  </TabsTrigger>
                  <TabsTrigger value="published" data-testid="tab-published-articles">
                    Published ({publishedArticlesCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="border rounded-md bg-background overflow-hidden min-w-0">
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-[300px] cursor-pointer hover:text-foreground" onClick={() => handleSort('title')}>
                                <div className="flex items-center gap-1">
                                    Title {sortConfig?.key === 'title' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('seoKeywords')}>
                                <div className="flex items-center gap-1">
                                    SEO Keywords {sortConfig?.key === 'seoKeywords' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('tags')}>
                                <div className="flex items-center gap-1">
                                    Tags {sortConfig?.key === 'tags' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="whitespace-nowrap">Word Count</TableHead>
                            <TableHead className="whitespace-nowrap">Read Time</TableHead>
                            <TableHead className="cursor-pointer hover:text-foreground text-right" onClick={() => handleSort('views')}>
                                <div className="flex items-center justify-end gap-1">
                                    Views {sortConfig?.key === 'views' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('publishedAt')}>
                                <div className="flex items-center gap-1">
                                    Published Date {sortConfig?.key === 'publishedAt' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="w-[80px] text-center cursor-pointer hover:text-foreground" onClick={() => handleSort('status')}>
                                <div className="flex items-center justify-center gap-1">
                                    Published {sortConfig?.key === 'status' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredArticles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredArticles.map((article) => (
                                <TableRow 
                                    key={article.id} 
                                    className="group cursor-pointer hover:bg-muted/30"
                                    onClick={() => handleEditPost(article)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded bg-secondary/50 flex items-center justify-center text-[10px] text-muted-foreground">
                                                📄
                                            </div>
                                            <span className="truncate max-w-[250px]">{article.title || "Untitled"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                                        {article.seoKeywords || "—"}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {article.tags ? (
                                            <Badge variant="secondary" className="text-[10px] font-normal h-5">
                                                {article.tags.split(',')[0]}
                                                {article.tags.split(',').length > 1 && ` +${article.tags.split(',').length - 1}`}
                                            </Badge>
                                        ) : "—"}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                                        {getWordCount(article.content).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {getReadingTime(article.content)}
                                    </TableCell>
                                    <TableCell className="text-xs text-right font-mono">
                                        {article.views}
                                    </TableCell>
                                    <TableCell className="text-xs whitespace-nowrap">
                                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '—'}
                                    </TableCell>
                                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox 
                                            checked={article.status === "Published"} 
                                            disabled={article.status === "Draft" && !canPublishArticle(article)}
                                            onCheckedChange={() => toggleArticleStatus(article)}
                                            data-testid={`checkbox-publish-${article.id}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditPost(article); }}>
                                                    <Edit2 className="mr-2 h-3 w-3" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteArticle(article.id, e)}>
                                                    <Trash2 className="mr-2 h-3 w-3" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "work" && (
            <div className="space-y-4 animate-in fade-in-50 duration-500">
              <div className="hidden md:block mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Work History</h2>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Filter work history..." 
                        className="pl-8 h-9 text-sm" 
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                    />
                </div>
                <Sheet open={isWorkSheetOpen} onOpenChange={(open) => {
                    setIsWorkSheetOpen(open);
                    if (!open) setEditingWork(null);
                }}>
                    <SheetTrigger asChild>
                        <Button onClick={handleNewWork} size="sm" className="gap-2 h-9 shadow-none w-full md:w-auto"><Plus className="h-4 w-4" /> Add Experience</Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                            <SheetHeader className="mb-6">
                                <SheetTitle>{editingWork?.company ? 'Edit Experience' : 'New Experience'}</SheetTitle>
                                <SheetDescription>
                                    Add details about your professional background.
                                </SheetDescription>
                            </SheetHeader>
                            {editingWork && (
                                <div className="space-y-8">
                                    {/* Company Information */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="company">Company Name</Label>
                                            <Input 
                                                id="company" 
                                                value={editingWork.company} 
                                                onChange={(e) => setEditingWork({...editingWork, company: e.target.value})}
                                                placeholder="e.g. Acme Corp"
                                                className="text-base"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role Title</Label>
                                            <Input 
                                                id="role" 
                                                value={editingWork.role} 
                                                onChange={(e) => setEditingWork({...editingWork, role: e.target.value})}
                                                placeholder="e.g. Senior Product Manager"
                                                className="text-base"
                                            />
                                        </div>
                                    </div>

                                    {/* Company Logo */}
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-sm font-medium mb-1">Company Logo</h3>
                                            <p className="text-xs text-muted-foreground">Optional - appears in your work history</p>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-muted/30 border border-border/50 rounded-lg">
                                            <div className="h-16 w-16 rounded-md border-2 border-dashed border-border flex items-center justify-center bg-background overflow-hidden flex-shrink-0">
                                                {editingWork.logo ? (
                                                    <img 
                                                        src={editingWork.logo} 
                                                        alt="Company logo" 
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <Briefcase className="h-6 w-6 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 flex items-center gap-3">
                                                <Input 
                                                    id="logo-upload" 
                                                    type="file" 
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setEditingWork({...editingWork, logo: reader.result as string});
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                <Label 
                                                    htmlFor="logo-upload" 
                                                    className="cursor-pointer inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    {editingWork.logo ? 'Change' : 'Upload'}
                                                </Label>
                                                {editingWork.logo && (
                                                    <Button 
                                                        type="button"
                                                        variant="ghost"
                                                        size="default"
                                                        onClick={() => setEditingWork({...editingWork, logo: ""})}
                                                        className="gap-2 text-muted-foreground hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Employment Period */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-medium mb-1">Employment Period</h3>
                                            <p className="text-xs text-muted-foreground">When did you work here?</p>
                                        </div>
                                        <div className="space-y-4 p-4 bg-muted/30 border border-border/50 rounded-lg">
                                            <MonthYearPicker
                                                label="Start Date"
                                                value={editingWork.startDate}
                                                onChange={(date) => setEditingWork({...editingWork, startDate: date})}
                                            />
                                            
                                            {editingWork.endDate !== "Present" && (
                                                <MonthYearPicker
                                                    label="End Date"
                                                    value={editingWork.endDate === "Present" ? "" : editingWork.endDate}
                                                    onChange={(date) => setEditingWork({...editingWork, endDate: date})}
                                                />
                                            )}

                                            <div className="flex items-center space-x-2 pt-2">
                                                <Checkbox 
                                                    id="present" 
                                                    checked={editingWork.endDate === "Present"}
                                                    onCheckedChange={(checked) => setEditingWork({...editingWork, endDate: checked ? "Present" : ""})}
                                                />
                                                <label
                                                    htmlFor="present"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    I currently work here
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea 
                                            id="description" 
                                            value={editingWork.description} 
                                            onChange={(e) => setEditingWork({...editingWork, description: e.target.value})}
                                            placeholder="Brief description of your responsibilities and achievements..."
                                            className="min-h-[140px] text-base"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-4 flex justify-end gap-2 border-t">
                                        <Button variant="outline" onClick={() => setIsWorkSheetOpen(false)} disabled={isSavingWork}>Cancel</Button>
                                        <Button onClick={handleSaveWork} disabled={isSavingWork || !editingWork?.company?.trim() || !editingWork?.role?.trim()}>
                                            {isSavingWork ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : 'Save Experience'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </SheetContent>
                    </Sheet>
                </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('company')}>
                        <div className="flex items-center gap-2">
                          Company
                          {sortConfig?.key === 'company' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('role')}>
                        <div className="flex items-center gap-2">
                          Role
                          {sortConfig?.key === 'role' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('startDate')}>
                        <div className="flex items-center gap-2">
                          Start Date
                          {sortConfig?.key === 'startDate' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('endDate')}>
                        <div className="flex items-center gap-2">
                          End Date
                          {sortConfig?.key === 'endDate' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWork.map((work) => (
                      <TableRow key={work.id} className="group cursor-pointer hover:bg-muted/50" onClick={() => handleEditWork(work)}>
                        <TableCell>
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-muted-foreground border border-border/50">
                             <Briefcase className="h-4 w-4" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{work.company}</TableCell>
                        <TableCell>{work.role}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatMonthYear(work.startDate) || '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {work.endDate === "Present" 
                            ? <Badge variant="secondary" className="font-normal text-xs">Present</Badge> 
                            : formatMonthYear(work.endDate) || '—'}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate text-muted-foreground text-sm">
                          {work.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEditWork(work); }}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => handleDeleteWork(work.id, e)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredWork.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No work experience found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === "writing" && isWriting && editingArticle && (
            <div className="animate-in fade-in-50 slide-in-from-right-2 duration-300 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" size="sm" onClick={() => { 
                  if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                  setIsWriting(false); 
                  setEditingArticle(null);
                  setSaveStatus("idle");
                }} className="gap-2 pl-0 hover:pl-2 transition-all text-muted-foreground">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div className="flex items-center gap-3">
                   <span className="text-xs text-muted-foreground">
                      {editingArticle.content.split(/\s/g).length} words
                   </span>
                   <Separator orientation="vertical" className="h-4" />
                   <Badge variant={editingArticle.status === "Published" ? "default" : "outline"} className="text-xs font-normal">
                      {editingArticle.status === "Published" ? "Published" : "Draft"}
                   </Badge>
                </div>
              </div>

              <div className="space-y-4">
                  <Textarea 
                    className="text-3xl md:text-4xl font-bold tracking-tight h-auto min-h-[1.5em] border-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 bg-transparent shadow-none rounded-none p-0 leading-tight resize-none overflow-hidden text-primary" 
                    placeholder="Untitled" 
                    value={editingArticle.title}
                    onChange={(e) => {
                      setEditingArticle({...editingArticle, title: e.target.value});
                      // Auto-resize height
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                    rows={1}
                    data-testid="input-article-title"
                  />
                  
                  <Editor 
                    content={editingArticle.content} 
                    onChange={(html) => setEditingArticle({...editingArticle, content: html})}
                  />
              </div>

              {/* Settings Drawer/Panel */}
              <div className="mt-8 md:mt-32 border-t pt-6 md:pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 opacity-40 hover:opacity-100 transition-all duration-500 ease-in-out group">
                  <div className="space-y-6">
                     <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                        <Settings className="h-4 w-4" />
                        Publishing
                     </div>
                     <div className="space-y-5">
                        <div className="flex items-center justify-between group/item p-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors">
                          <Label className="text-xs text-muted-foreground font-normal">Status</Label>
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                            const newStatus = editingArticle.status === "Published" ? "Draft" : "Published";
                            if (newStatus === "Published" && !canPublishArticle(editingArticle)) {
                              toast({
                                title: "Cannot Publish",
                                description: "Article must have a title and slug before publishing.",
                                variant: "destructive"
                              });
                              return;
                            }
                            setEditingArticle({...editingArticle, status: newStatus});
                          }}>
                            <Badge variant={editingArticle.status === "Published" ? "default" : "outline"} className="font-normal" data-testid="badge-article-status">
                              {editingArticle.status}
                            </Badge>
                            {editingArticle.status === "Draft" && !canPublishArticle(editingArticle) && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Title and slug required to publish</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 group/item p-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors">
                          <Label className="text-xs text-muted-foreground font-normal">Publish Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "h-9 w-full justify-start text-left font-normal text-xs",
                                  !editingArticle.publishedAt && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {editingArticle.publishedAt ? format(new Date(editingArticle.publishedAt), "MMM d, yyyy") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={editingArticle.publishedAt ? new Date(editingArticle.publishedAt) : undefined}
                                onSelect={(date) => date && setEditingArticle({...editingArticle, publishedAt: date})}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2 group/item p-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors">
                          <Label className="text-xs text-muted-foreground font-normal">URL Slug</Label>
                          <Input 
                            placeholder="url-slug" 
                            className="h-8 text-xs border-none bg-transparent shadow-none p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50"
                            value={editingArticle.slug}
                            onChange={(e) => setEditingArticle({...editingArticle, slug: e.target.value})}
                          />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6 md:col-span-2">
                     <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                        <Globe className="h-4 w-4" />
                        SEO & Metadata
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                       <div className="space-y-5">
                         <div className="space-y-2 group/item p-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors">
                           <Label className="text-xs text-muted-foreground font-normal">Excerpt</Label>
                           <Textarea 
                             className="min-h-[60px] text-xs resize-none border-none bg-transparent shadow-none p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50 leading-relaxed" 
                             placeholder="Short summary..." 
                             value={editingArticle.excerpt || ""}
                             onChange={(e) => setEditingArticle({...editingArticle, excerpt: e.target.value})}
                           />
                         </div>
                         <div className="space-y-2 group/item p-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors">
                           <Label className="text-xs text-muted-foreground font-normal">SEO Keywords</Label>
                           <Input 
                             placeholder="ai, design, future..." 
                             className="h-8 text-xs border-none bg-transparent shadow-none p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50" 
                             value={editingArticle.seoKeywords || ""}
                             onChange={(e) => setEditingArticle({...editingArticle, seoKeywords: e.target.value})}
                           />
                         </div>
                         <div className="space-y-2 group/item p-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors">
                           <Label className="text-xs text-muted-foreground font-normal">Tags</Label>
                           <Input 
                             placeholder="Design, Tech..." 
                             className="h-8 text-xs border-none bg-transparent shadow-none p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50" 
                             value={editingArticle.tags || ""}
                             onChange={(e) => setEditingArticle({...editingArticle, tags: e.target.value})}
                           />
                         </div>
                       </div>
                       <div className="space-y-2">
                         <Label className="text-xs text-muted-foreground font-normal px-2">Cover Image</Label>
                         <div className="aspect-video border border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center text-muted-foreground/50 hover:text-foreground hover:border-border hover:bg-secondary/20 transition-all cursor-pointer">
                            <Upload className="h-4 w-4 mb-2" />
                            <span className="text-[10px]">Upload Cover</span>
                         </div>
                       </div>
                     </div>
                  </div>
              </div>
            </div>
          )}

          {/* Travel Tab */}
          {activeTab === "travel" && (
            <div className="space-y-4 animate-in fade-in-50 duration-500">
              <div className="hidden md:block mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Travel History</h2>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Filter countries..." 
                        className="pl-8 h-9 text-sm" 
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                    />
                </div>
                <Sheet open={isTravelSheetOpen} onOpenChange={(open) => {
                    setIsTravelSheetOpen(open);
                    if (!open) setEditingTravel(null);
                }}>
                    <SheetTrigger asChild>
                        <Button onClick={handleNewTravel} size="sm" className="gap-2 h-9 shadow-none w-full md:w-auto"><Plus className="h-4 w-4" /> Add Visit</Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                            <SheetHeader className="mb-6">
                                <SheetTitle>{editingTravel?.id ? 'Edit Visit' : 'Add New Visit'}</SheetTitle>
                                <SheetDescription>
                                    Record a country you've visited or mark your home country.
                                </SheetDescription>
                            </SheetHeader>
                            {editingTravel && (
                                <div className="space-y-6">
                                    {/* Country Selection */}
                                    <div className="space-y-2">
                                        <Label>Country <span className="text-destructive">*</span></Label>
                                        <CountryCombobox
                                            value={editingTravel.countryCode}
                                            onSelect={(country) => {
                                                setEditingTravel({
                                                    ...editingTravel,
                                                    countryCode: country.code,
                                                    countryName: country.name,
                                                    continent: country.continent
                                                });
                                            }}
                                        />
                                        {!editingTravel.countryCode && (
                                            <p className="text-xs text-muted-foreground">Please select a country</p>
                                        )}
                                    </div>

                                    {/* Auto-populated Continent */}
                                    {editingTravel.continent && (
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">Continent</Label>
                                            <div>
                                                <Badge variant="secondary" className="text-sm">
                                                    {editingTravel.continent}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    {/* Home Country Toggle */}
                                    <div className="flex items-center space-x-2 p-4 bg-muted/30 border border-border/50 rounded-lg">
                                        <Checkbox 
                                            id="homeCountry" 
                                            checked={editingTravel.isHomeCountry}
                                            onCheckedChange={(checked) => setEditingTravel({
                                                ...editingTravel,
                                                isHomeCountry: checked === true,
                                                visitDate: checked ? "" : editingTravel.visitDate
                                            })}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor="homeCountry"
                                                className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                                            >
                                                <Home className="h-4 w-4" />
                                                This is my home country
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                Home country won't have a visit date
                                            </p>
                                        </div>
                                    </div>

                                    {/* Visit Date (hidden for home country) */}
                                    {!editingTravel.isHomeCountry && (
                                        <div className="space-y-2">
                                            <Label>Visit Date <span className="text-destructive">*</span></Label>
                                            <div className="p-4 bg-muted/30 border border-border/50 rounded-lg">
                                                <MonthYearPicker
                                                    label=""
                                                    value={editingTravel.visitDate}
                                                    onChange={(date) => setEditingTravel({...editingTravel, visitDate: date})}
                                                />
                                            </div>
                                            {!editingTravel.visitDate && (
                                                <p className="text-xs text-muted-foreground">Please select a visit date or mark as home country</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes (optional)</Label>
                                        <Textarea 
                                            id="notes" 
                                            value={editingTravel.notes} 
                                            onChange={(e) => setEditingTravel({...editingTravel, notes: e.target.value})}
                                            placeholder="Any memorable experiences or details..."
                                            className="min-h-[100px]"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-4 flex justify-end gap-2 border-t">
                                        <Button variant="outline" onClick={() => setIsTravelSheetOpen(false)} disabled={isSavingTravel}>Cancel</Button>
                                        <Button 
                                            onClick={handleSaveTravel}
                                            disabled={isSavingTravel || !editingTravel.countryCode || (!editingTravel.isHomeCountry && !editingTravel.visitDate)}
                                        >
                                            {isSavingTravel ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                editingTravel.id ? 'Save Changes' : 'Add Visit'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </SheetContent>
                    </Sheet>
              </div>

              {/* Travel History Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('countryName')}>
                        <div className="flex items-center gap-2">
                          Country
                          {(sortConfig?.key as string) === 'countryName' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                      </TableHead>
                      <TableHead>Continent</TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('visitDate')}>
                        <div className="flex items-center gap-2">
                          Visit Date
                          {(sortConfig?.key as string) === 'visitDate' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">Notes</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isTravelLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading travel history...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredTravel.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No travel history found. Add your first visit!
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTravel.map((entry) => {
                        const country = getCountryByCode(entry.countryCode);
                        return (
                          <TableRow 
                            key={entry.id} 
                            className="group cursor-pointer hover:bg-muted/50"
                            onClick={() => handleEditTravel(entry)}
                          >
                            <TableCell>
                              <span className="text-2xl">{country?.flag || "🏳️"}</span>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {entry.countryName}
                                {entry.isHomeCountry && (
                                  <Badge variant="outline" className="text-xs font-normal">
                                    <Home className="h-3 w-3 mr-1" />
                                    Home
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-normal text-xs">
                                {country?.continent || "—"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {entry.isHomeCountry ? (
                                <span className="text-muted-foreground/60">—</span>
                              ) : (
                                formatMonthYear(entry.visitDate || "") || "—"
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-[200px] truncate">
                              {entry.notes || "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8" 
                                  onClick={(e) => { e.stopPropagation(); handleEditTravel(entry); }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                                  onClick={(e) => handleDeleteTravel(entry.id, e)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Stats Summary */}
              {!isTravelLoading && travelHistory.length > 0 && (
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-4">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    <span>{new Set(travelHistory.filter(t => !t.isHomeCountry).map(t => t.countryCode)).size} countries visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>{new Set(travelHistory.map(t => getCountryByCode(t.countryCode)?.continent).filter(Boolean)).size} continents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{travelHistory.filter(t => !t.isHomeCountry).length} total visits</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Existing Tabs (Projects, Reading, Settings) - keeping them as is but ensuring they don't render when writing */}
          {!isWriting && activeTab === "reading" && (
            <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
              <ReadingTab />
            </Suspense>
          )}

          {!isWriting && activeTab === "media" && (
            <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
              <MediaTab />
            </Suspense>
          )}

          {!isWriting && activeTab === "seo" && (
            <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
              <SEOTab />
            </Suspense>
          )}

          {activeTab === "settings" && (
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
                      {/* Header Row: Icon + Label + Switch */}
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
                      {/* Input Row */}
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
                      {/* Header Row: Icon + Label + Switch */}
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
                      {/* Input Row */}
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
                      {/* Header Row: Icon + Label + Switch */}
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
                      {/* Input Row */}
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
                      {/* Header Row: Icon + Label + Switch */}
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
                      {/* Input Row */}
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
          )}
        </div>
      </main>
    </div>
  );
}
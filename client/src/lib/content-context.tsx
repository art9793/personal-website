import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Profile {
  name: string;
  title: string;
  bio: string;
  location?: string;
  email?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  avatarUrl?: string;
  showTwitter?: boolean;
  showLinkedin?: boolean;
  showGithub?: boolean;
  showEmail?: boolean;
}

export interface SeoSettings {
  id?: number;
  siteTitle: string;
  siteDescription: string;
  siteKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  faviconUrl?: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags?: string;
  seoKeywords?: string;
  author: string;
  status: string;
  views: string;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  link?: string;
  tags?: string;
  status: string;
  featured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkExperience {
  id: number;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  logo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReadingListItem {
  id: number;
  title: string;
  author: string;
  link?: string;
  description?: string;
  category?: string;
  status: string;
  rating?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContentContextType {
  profile: Profile | undefined;
  seoSettings: SeoSettings | undefined;
  articles: Article[];
  projects: Project[];
  workHistory: WorkExperience[];
  readingList: ReadingListItem[];
  isLoading: boolean;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateSeoSettings: (data: Partial<SeoSettings>) => Promise<void>;
  addArticle: (article: Partial<Article>) => Promise<void>;
  updateArticle: (id: number, data: Partial<Article>) => Promise<void>;
  deleteArticle: (id: number) => Promise<void>;
  addProject: (project: Partial<Project>) => Promise<void>;
  updateProject: (id: number, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  addWork: (work: Partial<WorkExperience>) => Promise<void>;
  updateWork: (id: number, data: Partial<WorkExperience>) => Promise<void>;
  deleteWork: (id: number) => Promise<void>;
  addReadingListItem: (item: Partial<ReadingListItem>) => Promise<void>;
  updateReadingListItem: (id: number, data: Partial<ReadingListItem>) => Promise<void>;
  deleteReadingListItem: (id: number) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  // Fetch SEO settings
  const { data: seoSettings, isLoading: seoLoading } = useQuery<SeoSettings>({
    queryKey: ["/api/seo-settings"],
  });

  // Fetch articles
  const { data: articles = [], isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch work experiences
  const { data: workHistory = [], isLoading: workLoading } = useQuery<WorkExperience[]>({
    queryKey: ["/api/work-experiences"],
  });

  // Fetch reading list
  const { data: readingList = [], isLoading: readingLoading } = useQuery<ReadingListItem[]>({
    queryKey: ["/api/reading-list"],
  });

  const handleUnauthorized = (error: Error) => {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return true;
    }
    return false;
  };

  // Profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: (error: Error) => {
      if (!handleUnauthorized(error)) {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
      }
    },
  });

  // SEO Settings mutation
  const updateSeoSettingsMutation = useMutation({
    mutationFn: async (data: Partial<SeoSettings>) => {
      const res = await fetch("/api/seo-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seo-settings"] });
      toast({
        title: "Success",
        description: "SEO settings updated",
      });
    },
    onError: (error: Error) => {
      if (!handleUnauthorized(error)) {
        toast({
          title: "Error",
          description: "Failed to update SEO settings",
          variant: "destructive",
        });
      }
    },
  });

  // Article mutations
  const addArticleMutation = useMutation({
    mutationFn: async (data: Partial<Article>) => {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
    onError: (error: Error) => handleUnauthorized(error),
  });

  const updateArticleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Article> }) => {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
    onError: (error: Error) => handleUnauthorized(error),
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
    onError: (error: Error) => handleUnauthorized(error),
  });

  // Project mutations
  const addProjectMutation = useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error: Error) => handleUnauthorized(error),
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Project> }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error: Error) => handleUnauthorized(error),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error: Error) => handleUnauthorized(error),
  });

  // Work Experience mutations
  const addWorkMutation = useMutation({
    mutationFn: async (data: Partial<WorkExperience>) => {
      const res = await fetch("/api/work-experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-experiences"] });
    },
    onError: (error: Error) => handleUnauthorized(error),
  });

  const updateWorkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<WorkExperience> }) => {
      const res = await fetch(`/api/work-experiences/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-experiences"] });
    },
    onError: (error: Error) => handleUnauthorized(error),
  });

  const deleteWorkMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/work-experiences/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-experiences"] });
    },
    onError: (error: Error) => handleUnauthorized(error),
  });

  // Reading List mutations
  const addReadingListItemMutation = useMutation({
    mutationFn: async (data: Partial<ReadingListItem>) => {
      const res = await fetch("/api/reading-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-list"] });
    },
    onError: (error: Error) => handleUnauthorized(error),
  });

  const updateReadingListItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ReadingListItem> }) => {
      const res = await fetch(`/api/reading-list/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-list"] });
    },
    onError: (error: Error) => handleUnauthorized(error),
  });

  const deleteReadingListItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/reading-list/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-list"] });
    },
    onError: (error: Error) => handleUnauthorized(error),
  });

  const value: ContentContextType = {
    profile,
    seoSettings,
    articles,
    projects,
    workHistory,
    readingList,
    isLoading: profileLoading || seoLoading || articlesLoading || projectsLoading || workLoading || readingLoading,
    updateProfile: (data) => updateProfileMutation.mutateAsync(data),
    updateSeoSettings: (data) => updateSeoSettingsMutation.mutateAsync(data),
    addArticle: (data) => addArticleMutation.mutateAsync(data),
    updateArticle: (id, data) => updateArticleMutation.mutateAsync({ id, data }),
    deleteArticle: (id) => deleteArticleMutation.mutateAsync(id),
    addProject: (data) => addProjectMutation.mutateAsync(data),
    updateProject: (id, data) => updateProjectMutation.mutateAsync({ id, data }),
    deleteProject: (id) => deleteProjectMutation.mutateAsync(id),
    addWork: (data) => addWorkMutation.mutateAsync(data),
    updateWork: (id, data) => updateWorkMutation.mutateAsync({ id, data }),
    deleteWork: (id) => deleteWorkMutation.mutateAsync(id),
    addReadingListItem: (data) => addReadingListItemMutation.mutateAsync(data),
    updateReadingListItem: (id, data) => updateReadingListItemMutation.mutateAsync({ id, data }),
    deleteReadingListItem: (id) => deleteReadingListItemMutation.mutateAsync(id),
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within ContentProvider");
  }
  return context;
}

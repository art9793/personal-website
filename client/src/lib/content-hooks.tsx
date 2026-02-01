import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

// Type definitions (shared with content-context.tsx)
export interface Profile {
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
  firstPublishedAt?: Date;
  lastPublishedAt?: Date;
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

export interface TravelHistoryEntry {
  id: number;
  countryCode: string;
  countryName: string;
  visitDate?: string; // "YYYY-MM" format, null for home country
  notes?: string;
  isHomeCountry?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Shared error handler
function handleUnauthorized(error: Error, toast: ReturnType<typeof useToast>["toast"]) {
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
}

// Profile hook
export function useProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

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
      if (!handleUnauthorized(error, toast)) {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
      }
    },
  });

  return {
    profile: profile ? {
      ...profile,
      showTwitter: profile.showTwitter ?? true,
      showLinkedin: profile.showLinkedin ?? true,
      showGithub: profile.showGithub ?? true,
      showEmail: profile.showEmail ?? true,
    } : undefined,
    isLoading,
    updateProfile: (data: Partial<Profile>) => updateProfileMutation.mutateAsync(data),
  };
}

// SEO Settings hook
export function useSeoSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: seoSettings, isLoading } = useQuery<SeoSettings>({
    queryKey: ["/api/seo-settings"],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

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
      if (!handleUnauthorized(error, toast)) {
        toast({
          title: "Error",
          description: "Failed to update SEO settings",
          variant: "destructive",
        });
      }
    },
  });

  return {
    seoSettings,
    isLoading,
    updateSeoSettings: (data: Partial<SeoSettings>) => updateSeoSettingsMutation.mutateAsync(data),
  };
}

// Articles hook
export function useArticles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

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
    onSuccess: (newArticle) => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      if (newArticle?.slug) {
        queryClient.invalidateQueries({ queryKey: ["article", newArticle.slug] });
      }
      queryClient.invalidateQueries({ queryKey: ["article"] });
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
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
      return await res.json();
    },
    onSuccess: (updatedArticle) => {
      // Directly update the cache to bypass browser HTTP caching
      queryClient.setQueryData<Article[]>(["/api/articles"], (oldArticles) => {
        if (!oldArticles) return oldArticles;
        return oldArticles.map(article => 
          article.id === updatedArticle.id ? updatedArticle : article
        );
      });
      // Invalidate individual article queries (these don't have HTTP caching issues)
      if (updatedArticle?.slug) {
        queryClient.invalidateQueries({ queryKey: ["article", updatedArticle.slug] });
      }
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Directly remove from cache to bypass browser HTTP caching
      queryClient.setQueryData<Article[]>(["/api/articles"], (oldArticles) => {
        if (!oldArticles) return oldArticles;
        return oldArticles.filter(article => article.id !== deletedId);
      });
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
  });

  return {
    articles,
    isLoading,
    addArticle: (data: Partial<Article>) => addArticleMutation.mutateAsync(data),
    updateArticle: (id: number, data: Partial<Article>) => updateArticleMutation.mutateAsync({ id, data }),
    deleteArticle: (id: number) => deleteArticleMutation.mutateAsync(id),
  };
}

// Projects hook
export function useProjects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
    onSuccess: (newProject) => {
      // Directly add to cache for immediate UI update
      queryClient.setQueryData<Project[]>(["/api/projects"], (oldProjects) => {
        if (!oldProjects) return [newProject];
        return [newProject, ...oldProjects];
      });
      // Don't invalidate - setQueryData already updated the cache
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
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
    onSuccess: (updatedProject) => {
      // Directly update the cache to bypass browser HTTP caching
      queryClient.setQueryData<Project[]>(["/api/projects"], (oldProjects) => {
        if (!oldProjects) return oldProjects;
        return oldProjects.map(project => 
          project.id === updatedProject.id ? updatedProject : project
        );
      });
      // Don't invalidate - setQueryData already updated the cache
      // invalidateQueries would refetch stale browser-cached data
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Directly remove from cache to bypass browser HTTP caching
      queryClient.setQueryData<Project[]>(["/api/projects"], (oldProjects) => {
        if (!oldProjects) return oldProjects;
        return oldProjects.filter(project => project.id !== deletedId);
      });
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
  });

  return {
    projects,
    isLoading,
    addProject: (data: Partial<Project>) => addProjectMutation.mutateAsync(data),
    updateProject: (id: number, data: Partial<Project>) => updateProjectMutation.mutateAsync({ id, data }),
    deleteProject: (id: number) => deleteProjectMutation.mutateAsync(id),
  };
}

// Work Experiences hook
export function useWorkExperiences() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: workHistory = [], isLoading } = useQuery<WorkExperience[]>({
    queryKey: ["/api/work-experiences"],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

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
    onSuccess: (newWork) => {
      // Directly add to cache for immediate UI update
      queryClient.setQueryData<WorkExperience[]>(["/api/work-experiences"], (oldWork) => {
        if (!oldWork) return [newWork];
        return [newWork, ...oldWork];
      });
      // Don't invalidate - setQueryData already updated the cache
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
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
    onSuccess: (updatedWork) => {
      // Directly update the cache to bypass browser HTTP caching
      queryClient.setQueryData<WorkExperience[]>(["/api/work-experiences"], (oldWork) => {
        if (!oldWork) return oldWork;
        return oldWork.map(work => 
          work.id === updatedWork.id ? updatedWork : work
        );
      });
      // Don't invalidate - setQueryData already updated the cache
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
  });

  const deleteWorkMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/work-experiences/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Directly remove from cache to bypass browser HTTP caching
      queryClient.setQueryData<WorkExperience[]>(["/api/work-experiences"], (oldWork) => {
        if (!oldWork) return oldWork;
        return oldWork.filter(work => work.id !== deletedId);
      });
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
  });

  return {
    workHistory,
    isLoading,
    addWork: (data: Partial<WorkExperience>) => addWorkMutation.mutateAsync(data),
    updateWork: (id: number, data: Partial<WorkExperience>) => updateWorkMutation.mutateAsync({ id, data }),
    deleteWork: (id: number) => deleteWorkMutation.mutateAsync(id),
  };
}

// Reading List hook
export function useReadingList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: readingList = [], isLoading } = useQuery<ReadingListItem[]>({
    queryKey: ["/api/reading-list"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
    onSuccess: (newItem) => {
      // Directly add to cache for immediate UI update
      queryClient.setQueryData<ReadingListItem[]>(["/api/reading-list"], (oldList) => {
        if (!oldList) return [newItem];
        return [newItem, ...oldList];
      });
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
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
    onSuccess: (updatedItem) => {
      // Directly update the cache to bypass browser HTTP caching
      queryClient.setQueryData<ReadingListItem[]>(["/api/reading-list"], (oldList) => {
        if (!oldList) return oldList;
        return oldList.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        );
      });
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
  });

  const deleteReadingListItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/reading-list/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Directly remove from cache to bypass browser HTTP caching
      queryClient.setQueryData<ReadingListItem[]>(["/api/reading-list"], (oldList) => {
        if (!oldList) return oldList;
        return oldList.filter(item => item.id !== deletedId);
      });
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
  });

  return {
    readingList,
    isLoading,
    addReadingListItem: (data: Partial<ReadingListItem>) => addReadingListItemMutation.mutateAsync(data),
    updateReadingListItem: (id: number, data: Partial<ReadingListItem>) => updateReadingListItemMutation.mutateAsync({ id, data }),
    deleteReadingListItem: (id: number) => deleteReadingListItemMutation.mutateAsync(id),
  };
}

// Travel History hook
export function useTravelHistory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: travelHistory = [], isLoading } = useQuery<TravelHistoryEntry[]>({
    queryKey: ["/api/travel-history"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const addTravelHistoryMutation = useMutation({
    mutationFn: async (data: Partial<TravelHistoryEntry>) => {
      const res = await fetch("/api/travel-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: (newTravel) => {
      // Directly add to cache for immediate UI update
      queryClient.setQueryData<TravelHistoryEntry[]>(["/api/travel-history"], (oldTravel) => {
        if (!oldTravel) return [newTravel];
        return [newTravel, ...oldTravel];
      });
      // Don't invalidate - setQueryData already updated the cache
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
  });

  const updateTravelHistoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TravelHistoryEntry> }) => {
      const res = await fetch(`/api/travel-history/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: (updatedTravel) => {
      // Directly update the cache to bypass browser HTTP caching
      queryClient.setQueryData<TravelHistoryEntry[]>(["/api/travel-history"], (oldTravel) => {
        if (!oldTravel) return oldTravel;
        return oldTravel.map(entry => 
          entry.id === updatedTravel.id ? updatedTravel : entry
        );
      });
      // Don't invalidate - setQueryData already updated the cache
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
  });

  const deleteTravelHistoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/travel-history/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return id; // Return the deleted id
    },
    onSuccess: (deletedId) => {
      // Directly remove from cache to bypass browser HTTP caching
      queryClient.setQueryData<TravelHistoryEntry[]>(["/api/travel-history"], (oldTravel) => {
        if (!oldTravel) return oldTravel;
        return oldTravel.filter(entry => entry.id !== deletedId);
      });
    },
    onError: (error: Error) => handleUnauthorized(error, toast),
  });

  return {
    travelHistory,
    isLoading,
    addTravelHistory: (data: Partial<TravelHistoryEntry>) => addTravelHistoryMutation.mutateAsync(data),
    updateTravelHistory: (id: number, data: Partial<TravelHistoryEntry>) => updateTravelHistoryMutation.mutateAsync({ id, data }),
    deleteTravelHistory: (id: number) => deleteTravelHistoryMutation.mutateAsync(id),
  };
}


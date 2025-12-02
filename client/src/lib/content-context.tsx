import { createContext, useContext, ReactNode } from "react";
import { useProfile, useSeoSettings, useArticles, useProjects, useWorkExperiences, useReadingList } from "./content-hooks";
import type { Profile, SeoSettings, Article, Project, WorkExperience, ReadingListItem } from "./content-hooks";

// Re-export types for backward compatibility
export type { Profile, SeoSettings, Article, Project, WorkExperience, ReadingListItem } from "./content-hooks";

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
  addArticle: (article: Partial<Article>) => Promise<Article>;
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
  // Use granular hooks - this maintains backward compatibility while allowing
  // pages to use individual hooks for better performance
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { seoSettings, isLoading: seoLoading, updateSeoSettings } = useSeoSettings();
  const { articles, isLoading: articlesLoading, addArticle, updateArticle, deleteArticle } = useArticles();
  const { projects, isLoading: projectsLoading, addProject, updateProject, deleteProject } = useProjects();
  const { workHistory, isLoading: workLoading, addWork, updateWork, deleteWork } = useWorkExperiences();
  const { readingList, isLoading: readingLoading, addReadingListItem, updateReadingListItem, deleteReadingListItem } = useReadingList();

  const value: ContentContextType = {
    profile,
    seoSettings,
    articles,
    projects,
    workHistory,
    readingList,
    isLoading: profileLoading || seoLoading || articlesLoading || projectsLoading || workLoading || readingLoading,
    updateProfile,
    updateSeoSettings,
    addArticle,
    updateArticle,
    deleteArticle,
    addProject,
    updateProject,
    deleteProject,
    addWork,
    updateWork,
    deleteWork,
    addReadingListItem,
    updateReadingListItem,
    deleteReadingListItem,
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

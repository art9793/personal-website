import { createContext, useContext, useState, useEffect } from "react";

interface Profile {
  name: string;
  jobTitle: string;
  bio: string;
  email: string;
  twitter: string;
  github: string;
  linkedin: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  date: string;
  status: "Draft" | "Published";
  views: string;
  excerpt?: string;
  featuredImage?: string;
  seoKeywords?: string;
  tags?: string;
  author?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
  tags: string;
  status: "Active" | "Archived";
  featured: boolean;
  date: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  logo?: string;
}

interface ContentContextType {
  profile: Profile;
  articles: Article[];
  projects: Project[];
  workHistory: WorkExperience[];
  updateProfile: (newProfile: Partial<Profile>) => void;
  addArticle: (article: Article) => void;
  updateArticle: (id: string, updatedArticle: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updatedProject: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addWork: (work: WorkExperience) => void;
  updateWork: (id: string, updatedWork: Partial<WorkExperience>) => void;
  deleteWork: (id: string) => void;
}

const defaultProfile: Profile = {
  name: "Arshad Teli",
  jobTitle: "Product Manager",
  bio: "Hey there! I’m a Product Manager & Designer currently working at a UK based fintech!",
  email: "art9793@gmail.com",
  twitter: "https://x.com/art9793",
  github: "https://github.com/art9793",
  linkedin: "",
};

const defaultArticles: Article[] = [
  { 
    id: "1", 
    title: "Designing for AI", 
    slug: "designing-for-ai", 
    content: "<h2>Introduction</h2><p>Start writing...</p>", 
    date: "2024-10-24", 
    status: "Published", 
    views: "2.4k",
    excerpt: "Exploring the challenges and opportunities...",
    tags: "Design, AI",
    author: "Arshad Teli",
    seoKeywords: "ai, design, ux"
  },
  { 
    id: "2", 
    title: "The craft of software", 
    slug: "craft-of-software", 
    content: "<h2>Introduction</h2><p>Start writing...</p>", 
    date: "2024-08-12", 
    status: "Published", 
    views: "1.8k",
    excerpt: "Why details matter in software...",
    tags: "Engineering, Craft",
    author: "Arshad Teli",
    seoKeywords: "software, craft, engineering"
  },
  { 
    id: "3", 
    title: "Building Campsite", 
    slug: "building-campsite", 
    content: "<h2>Introduction</h2><p>Start writing...</p>", 
    date: "2024-05-03", 
    status: "Published", 
    views: "3.2k",
    excerpt: "A journey of building a new product...",
    tags: "Product, Startup",
    author: "Arshad Teli",
    seoKeywords: "startup, product, campsite"
  },
  { 
    id: "4", 
    title: "Future of Interfaces", 
    slug: "future-of-interfaces", 
    content: "<h2>Introduction</h2><p>Start writing...</p>", 
    date: "2024-11-22", 
    status: "Draft", 
    views: "0",
    excerpt: "What comes after screens?",
    tags: "Future, UI",
    author: "Arshad Teli",
    seoKeywords: "ui, future, interfaces"
  }
];

const defaultProjects: Project[] = [
  {
    id: "1",
    title: "Campsite",
    description: "A new way to share work in progress",
    link: "https://campsite.design",
    tags: "Product, Design",
    status: "Active",
    featured: true,
    date: "2024-01-15"
  },
  {
    id: "2",
    title: "Replit Mobile",
    description: "Coding on the go",
    link: "https://replit.com/mobile",
    tags: "Mobile, Engineering",
    status: "Active",
    featured: true,
    date: "2023-08-20"
  },
  {
    id: "3",
    title: "Personal Site V1",
    description: "Previous iteration of this website",
    link: "#",
    tags: "Web, Design",
    status: "Archived",
    featured: false,
    date: "2022-05-10"
  }
];

const defaultWorkHistory: WorkExperience[] = [
  {
    id: "1",
    company: "Acme Corp",
    role: "Senior Product Manager",
    period: "2022 - Present",
    description: "Leading the core product team to build the future of finance.",
    logo: "AC"
  },
  {
    id: "2",
    company: "TechStart",
    role: "Product Designer",
    period: "2020 - 2022",
    description: "Designed the initial MVP and scaled the design system.",
    logo: "TS"
  }
];

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem("site-profile");
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem("site-articles");
    return saved ? JSON.parse(saved) : defaultArticles;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("site-projects");
    return saved ? JSON.parse(saved) : defaultProjects;
  });

  const [workHistory, setWorkHistory] = useState<WorkExperience[]>(() => {
    const saved = localStorage.getItem("site-work");
    return saved ? JSON.parse(saved) : defaultWorkHistory;
  });

  useEffect(() => {
    localStorage.setItem("site-profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("site-articles", JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem("site-projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("site-work", JSON.stringify(workHistory));
  }, [workHistory]);

  const updateProfile = (newProfile: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...newProfile }));
  };

  const addArticle = (article: Article) => {
    setArticles((prev) => [article, ...prev]);
  };

  const updateArticle = (id: string, updatedArticle: Partial<Article>) => {
    setArticles((prev) => prev.map(a => a.id === id ? { ...a, ...updatedArticle } : a));
  };

  const deleteArticle = (id: string) => {
    setArticles((prev) => prev.filter(a => a.id !== id));
  };

  const addProject = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
  };

  const updateProject = (id: string, updatedProject: Partial<Project>) => {
    setProjects((prev) => prev.map(p => p.id === id ? { ...p, ...updatedProject } : p));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter(p => p.id !== id));
  };

  const addWork = (work: WorkExperience) => {
    setWorkHistory((prev) => [work, ...prev]);
  };

  const updateWork = (id: string, updatedWork: Partial<WorkExperience>) => {
    setWorkHistory((prev) => prev.map(w => w.id === id ? { ...w, ...updatedWork } : w));
  };

  const deleteWork = (id: string) => {
    setWorkHistory((prev) => prev.filter(w => w.id !== id));
  };

  return (
    <ContentContext.Provider value={{ 
      profile, articles, projects, workHistory,
      updateProfile, addArticle, updateArticle, deleteArticle,
      addProject, updateProject, deleteProject,
      addWork, updateWork, deleteWork
    }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}

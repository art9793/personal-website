import type {
  Article,
  Profile,
  Project,
  ReadingListItem,
  TravelHistoryEntry,
  WorkExperience,
} from "@shared/schema";
import { storage } from "../../server/storage";

const ALLOWED_IFRAME_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "open.spotify.com",
  "codepen.io",
  "codesandbox.io",
]);

const continentMap: Record<string, string> = {
  IN: "Asia",
  TH: "Asia",
  ID: "Asia",
  SA: "Asia",
  VN: "Asia",
  JP: "Asia",
  MY: "Asia",
  CN: "Asia",
  KR: "Asia",
  SG: "Asia",
  PH: "Asia",
  AE: "Asia",
  QA: "Asia",
  KW: "Asia",
  BH: "Asia",
  OM: "Asia",
  LK: "Asia",
  NP: "Asia",
  BD: "Asia",
  PK: "Asia",
  ES: "Europe",
  PT: "Europe",
  DE: "Europe",
  NL: "Europe",
  FR: "Europe",
  IT: "Europe",
  GB: "Europe",
  CH: "Europe",
  AT: "Europe",
  BE: "Europe",
  SE: "Europe",
  NO: "Europe",
  DK: "Europe",
  FI: "Europe",
  IE: "Europe",
  PL: "Europe",
  CZ: "Europe",
  GR: "Europe",
  HU: "Europe",
  RO: "Europe",
  AU: "Oceania",
  NZ: "Oceania",
  FJ: "Oceania",
  US: "Americas",
  CA: "Americas",
  MX: "Americas",
  BR: "Americas",
  AR: "Americas",
  CL: "Americas",
  CO: "Americas",
  PE: "Americas",
  ZA: "Africa",
  EG: "Africa",
  MA: "Africa",
  KE: "Africa",
  NG: "Africa",
  GH: "Africa",
  TZ: "Africa",
  ET: "Africa",
};

export interface GroupedTravelCountry {
  countryCode: string;
  countryName: string;
  visits: string[];
  isHomeCountry: boolean;
}

export async function getPublicProfile(): Promise<Profile | null> {
  const profile = await storage.getProfile();
  if (!profile) return null;
  return {
    ...profile,
    showTwitter: profile.showTwitter ?? true,
    showLinkedin: profile.showLinkedin ?? true,
    showGithub: profile.showGithub ?? true,
    showEmail: profile.showEmail ?? true,
  };
}

export async function getPublishedArticles(): Promise<Article[]> {
  const articles = await storage.getPublishedArticles();
  return [...articles].sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });
}

export async function getActiveProjects(): Promise<Project[]> {
  const projects = await storage.getActiveProjects();
  return [...projects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });
}

export async function getHomeData() {
  const [profile, activeProjects, articles] = await Promise.all([
    getPublicProfile(),
    getActiveProjects(),
    getPublishedArticles(),
  ]);

  return {
    profile,
    featuredProjects: activeProjects.filter((project) => project.featured).slice(0, 4),
    recentPosts: articles.slice(0, 3),
  };
}

export async function getWritingData() {
  const publishedPosts = await getPublishedArticles();
  const postsByYear = publishedPosts.reduce<Record<string, Article[]>>((acc, post) => {
    if (!post.publishedAt) return acc;
    const year = new Date(post.publishedAt).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});
  return { publishedPosts, postsByYear };
}

export async function getReadingData() {
  const readingList = await storage.getReadingList();
  const groupedBooks = readingList.reduce<Record<string, ReadingListItem[]>>((acc, item) => {
    const year = item.createdAt ? new Date(item.createdAt).getFullYear().toString() : "Other";
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {});
  return { readingList, groupedBooks };
}

export async function getWorkData() {
  const [profile, workHistory] = await Promise.all([getPublicProfile(), storage.getWorkExperiences()]);
  const sortedWorkHistory = [...workHistory].sort((a, b) => {
    const toSortDate = (endDate: string | null) => {
      if (!endDate || endDate.toLowerCase() === "present") return new Date();
      const parsed = new Date(endDate);
      return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
    };
    return toSortDate(b.endDate).getTime() - toSortDate(a.endDate).getTime();
  });
  return { profile, workHistory: sortedWorkHistory };
}

export async function getTravelData() {
  const travelHistory = await storage.getTravelHistory();
  const groupedMap = travelHistory.reduce<Record<string, GroupedTravelCountry>>((acc, entry) => {
    const code = entry.countryCode?.toUpperCase()?.trim() || "";
    if (!code) return acc;
    if (!acc[code]) {
      acc[code] = {
        countryCode: code,
        countryName: entry.countryName,
        visits: [],
        isHomeCountry: entry.isHomeCountry ?? false,
      };
    } else if (entry.isHomeCountry) {
      acc[code].isHomeCountry = true;
    }
    if (entry.visitDate) acc[code].visits.push(entry.visitDate);
    return acc;
  }, {});

  const groupedTravelData = Object.values(groupedMap).map((country) => ({
    ...country,
    visits: [...country.visits].sort(),
  }));

  const countriesToCount = groupedTravelData.filter((entry) => entry.visits.length > 0 && !entry.isHomeCountry);
  const totalCountries = new Set(countriesToCount.map((entry) => entry.countryCode)).size;
  const countriesForContinents = groupedTravelData.filter((entry) => entry.visits.length > 0 || entry.isHomeCountry);
  const continentsVisited = new Set(
    countriesForContinents
      .map((entry) => continentMap[entry.countryCode])
      .filter((value): value is string => Boolean(value)),
  ).size;

  return {
    travelHistory,
    groupedTravelData,
    stats: {
      totalCountries,
      continentsVisited,
      worldPercentage: Math.round((totalCountries / 195) * 100),
    },
  };
}

export async function getPublishedArticleBySlug(slug: string): Promise<Article | null> {
  const article = await storage.getArticleBySlug(slug);
  if (!article || article.status !== "Published") return null;
  return article;
}

export function sanitizeArticleHtml(content: string): string {
  let output = content;
  output = output.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  output = output.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
  output = output.replace(/<(object|embed|applet|form)[\s\S]*?>[\s\S]*?<\/\1>/gi, "");
  output = output.replace(/\s+on[a-z]+\s*=\s*(['"]).*?\1/gi, "");
  output = output.replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, "");
  output = output.replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ' $1="#"');
  output = output.replace(/<iframe\b([^>]*)>/gi, (fullMatch, attrs: string) => {
    const srcMatch = attrs.match(/\ssrc\s*=\s*(['"])(.*?)\1/i);
    if (!srcMatch || !srcMatch[2]) return "";
    try {
      const parsed = new URL(srcMatch[2], "https://example.com");
      const host = parsed.hostname;
      if (!ALLOWED_IFRAME_HOSTS.has(host)) return "";
      return fullMatch;
    } catch {
      return "";
    }
  });
  return output;
}

export function formatArticleHref(article: Pick<Article, "id" | "slug">): string {
  return `/article/${article.slug || article.id}`;
}

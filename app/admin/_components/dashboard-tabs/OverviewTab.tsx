import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PenTool, FolderGit2, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsData {
  totalViews: number;
  publishedCount: number;
}

interface OverviewTabProps {
  profileName?: string;
  articlesCount: number;
  draftArticlesCount: number;
  projectsCount: number;
  onChangeTab: (tab: string) => void;
  onNewPost: () => void;
}

export function OverviewTab({
  profileName,
  articlesCount,
  draftArticlesCount,
  projectsCount,
  onChangeTab,
  onNewPost,
}: OverviewTabProps) {
  const { data: analytics, isLoading: analyticsLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  const totalViews = analytics?.totalViews || 0;

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in-50 duration-300">
      <div className="hidden md:block">
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {profileName?.split(' ')[0] || 'Admin'}!</h2>
        <p className="text-muted-foreground mt-1">Here's what's happening with your website today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" /> Article Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : isError ? (
              <div className="text-3xl font-bold tracking-tight text-muted-foreground">—</div>
            ) : (
              <div className="text-3xl font-bold tracking-tight">
                {totalViews.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Total all time
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{articlesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {draftArticlesCount} drafts pending
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{projectsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All active
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
           <Button onClick={() => { onChangeTab("writing"); onNewPost(); }} className="gap-2 shadow-none w-full md:w-auto">
             <PenTool className="h-4 w-4" /> Write Article
           </Button>
           <Button onClick={() => onChangeTab("projects")} variant="outline" className="gap-2 shadow-none w-full md:w-auto">
             <FolderGit2 className="h-4 w-4" /> Add Project
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}


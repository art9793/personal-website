import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PenTool, FolderGit2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";

interface AnalyticsData {
  dailyData: Array<{ name: string; visits: number; pageViews: number }>;
  totalViews: number;
  totalUniques: number;
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
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const visitorData = analytics?.dailyData || [];
  const totalViews = analytics?.totalViews || 0;

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in-50 duration-500">
      <div className="hidden md:block">
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {profileName?.split(' ')[0] || 'Admin'}!</h2>
        <p className="text-muted-foreground mt-1">Here's what's happening with your website today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border/50 hidden md:block">
          <CardHeader>
            <CardTitle>Daily Visitors</CardTitle>
            <CardDescription>
              Traffic trends for the past 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              {analyticsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : visitorData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No analytics data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={visitorData}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: 'var(--radius)', 
                        border: '1px solid hsl(var(--border))', 
                        boxShadow: 'var(--shadow-sm)',
                        backgroundColor: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))'
                      }}
                      cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="visits" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 md:space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Page Views (7d)</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold tracking-tight">
                  {totalViews.toLocaleString()}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Last 7 days
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


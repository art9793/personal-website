import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenTool, FolderGit2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, RechartsTooltip, ResponsiveContainer } from 'recharts';

const visitorData = [
  { name: 'Mon', visits: 1240 },
  { name: 'Tue', visits: 1450 },
  { name: 'Wed', visits: 1800 },
  { name: 'Thu', visits: 1600 },
  { name: 'Fri', visits: 2100 },
  { name: 'Sat', visits: 1900 },
  { name: 'Sun', visits: 2300 },
];

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
                  <RechartsTooltip 
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
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 md:space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">12,345</div>
              <p className="text-xs text-green-500 flex items-center mt-1 font-medium">
                +12% from last month
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


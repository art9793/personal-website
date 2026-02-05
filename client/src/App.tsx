import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import { ContentProvider } from "@/lib/content-context";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, lazy, Suspense } from "react";
import {
  HomeSkeleton,
  WritingSkeleton,
  ProjectsSkeleton,
  ArticleSkeleton,
  TravelSkeleton,
  WorkSkeleton,
  ReadingSkeleton,
  GenericSkeleton,
} from "@/components/skeletons/PageSkeletons";

const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const Writing = lazy(() => import("@/pages/writing"));
const Article = lazy(() => import("@/pages/article"));
const Projects = lazy(() => import("@/pages/projects"));
const Reading = lazy(() => import("@/pages/reading"));
const Travel = lazy(() => import("@/pages/travel"));
const Work = lazy(() => import("@/pages/work"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminLogin = lazy(() => import("@/pages/admin/login"));
const ArticleEditor = lazy(() => import("@/pages/admin/article-editor"));

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Redirecting to login...</div>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  if (isAdmin) {
    return (
      <ContentProvider>
        <Switch>
          <Route path="/admin/login">
            <Suspense fallback={<GenericSkeleton />}>
              <AdminLogin />
            </Suspense>
          </Route>
          <Route path="/admin/article/:id">
            {() => (
              <Suspense fallback={<GenericSkeleton />}>
                <ProtectedRoute component={ArticleEditor} />
              </Suspense>
            )}
          </Route>
          <Route path="/admin">
            {() => (
              <Suspense fallback={<GenericSkeleton />}>
                <ProtectedRoute component={AdminDashboard} />
              </Suspense>
            )}
          </Route>
          <Route>
            <Suspense fallback={<GenericSkeleton />}>
              <NotFound />
            </Suspense>
          </Route>
        </Switch>
      </ContentProvider>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/">
          <Suspense fallback={<HomeSkeleton />}>
            <Home />
          </Suspense>
        </Route>
        <Route path="/writing">
          <Suspense fallback={<WritingSkeleton />}>
            <Writing />
          </Suspense>
        </Route>
        <Route path="/article/:slug">
          <Suspense fallback={<ArticleSkeleton />}>
            <Article />
          </Suspense>
        </Route>
        <Route path="/projects">
          <Suspense fallback={<ProjectsSkeleton />}>
            <Projects />
          </Suspense>
        </Route>
        <Route path="/reading">
          <Suspense fallback={<ReadingSkeleton />}>
            <Reading />
          </Suspense>
        </Route>
        <Route path="/travel">
          <Suspense fallback={<TravelSkeleton />}>
            <Travel />
          </Suspense>
        </Route>
        <Route path="/work">
          <Suspense fallback={<WorkSkeleton />}>
            <Work />
          </Suspense>
        </Route>
        <Route>
          <Suspense fallback={<GenericSkeleton />}>
            <NotFound />
          </Suspense>
        </Route>
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

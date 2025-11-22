import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import { ContentProvider } from "@/lib/content-context";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, lazy, Suspense } from "react";

const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const Writing = lazy(() => import("@/pages/writing"));
const Article = lazy(() => import("@/pages/article"));
const Projects = lazy(() => import("@/pages/projects"));
const Reading = lazy(() => import("@/pages/reading"));
const Work = lazy(() => import("@/pages/work"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminLogin = lazy(() => import("@/pages/admin/login"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isAuthenticated, isLoading } = useAuth();
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

  // Check if user's email is authorized for admin access
  const authorizedEmail = "art9793@gmail.com";
  if (user && user.email !== authorizedEmail) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            Only the site owner can access the admin dashboard.
          </p>
          <a 
            href="/" 
            className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Home
          </a>
        </div>
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
      <Switch>
        <Route path="/admin/login">
          <Suspense fallback={<LoadingFallback />}>
            <AdminLogin />
          </Suspense>
        </Route>
        <Route path="/admin">
          {() => (
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute component={AdminDashboard} />
            </Suspense>
          )}
        </Route>
        <Route>
          <Suspense fallback={<LoadingFallback />}>
            <NotFound />
          </Suspense>
        </Route>
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/">
          <Suspense fallback={<LoadingFallback />}>
            <Home />
          </Suspense>
        </Route>
        <Route path="/writing">
          <Suspense fallback={<LoadingFallback />}>
            <Writing />
          </Suspense>
        </Route>
        <Route path="/article/:slug">
          <Suspense fallback={<LoadingFallback />}>
            <Article />
          </Suspense>
        </Route>
        <Route path="/projects">
          <Suspense fallback={<LoadingFallback />}>
            <Projects />
          </Suspense>
        </Route>
        <Route path="/reading">
          <Suspense fallback={<LoadingFallback />}>
            <Reading />
          </Suspense>
        </Route>
        <Route path="/work">
          <Suspense fallback={<LoadingFallback />}>
            <Work />
          </Suspense>
        </Route>
        <Route>
          <Suspense fallback={<LoadingFallback />}>
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
      <ContentProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ContentProvider>
    </QueryClientProvider>
  );
}

export default App;

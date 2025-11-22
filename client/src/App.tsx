import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Writing from "@/pages/writing";
import Article from "@/pages/article";
import Projects from "@/pages/projects";
import Reading from "@/pages/reading";
import Work from "@/pages/work";
import AdminDashboard from "@/pages/admin/dashboard";
import { ContentProvider } from "@/lib/content-context";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
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
        <Route path="/admin">
          {() => <ProtectedRoute component={AdminDashboard} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/writing" component={Writing} />
        <Route path="/article/:slug" component={Article} />
        <Route path="/projects" component={Projects} />
        <Route path="/reading" component={Reading} />
        <Route path="/work" component={Work} />
        <Route component={NotFound} />
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

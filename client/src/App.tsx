import { Switch, Route } from "wouter";
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

function Router() {
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

"use client";

import { lazy, Suspense, Component, type ErrorInfo, type ReactNode } from "react";

const OverviewTab = lazy(() => import("./dashboard-tabs/OverviewTab").then((m) => ({ default: m.OverviewTab })));
const ReadingTab = lazy(() => import("./dashboard-tabs/ReadingTab").then((m) => ({ default: m.ReadingTab })));
const MediaTab = lazy(() => import("./dashboard-tabs/MediaTab").then((m) => ({ default: m.MediaTab })));
const SEOTab = lazy(() => import("./dashboard-tabs/SEOTab").then((m) => ({ default: m.SEOTab })));
const ProjectsTab = lazy(() => import("./dashboard-tabs/ProjectsTab").then((m) => ({ default: m.ProjectsTab })));
const WorkTab = lazy(() => import("./dashboard-tabs/WorkTab").then((m) => ({ default: m.WorkTab })));
const TravelTab = lazy(() => import("./dashboard-tabs/TravelTab").then((m) => ({ default: m.TravelTab })));
const WritingTab = lazy(() => import("./dashboard-tabs/WritingTab").then((m) => ({ default: m.WritingTab })));
const SettingsTab = lazy(() => import("./dashboard-tabs/SettingsTab").then((m) => ({ default: m.SettingsTab })));

class TabErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Dashboard tab error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="mb-4 text-sm text-muted-foreground">Something went wrong loading this tab.</p>
          <button
            className="text-sm text-primary underline underline-offset-4"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface AdminTabContentProps {
  activeTab: string;
  profileName?: string;
  articlesCount: number;
  draftArticlesCount: number;
  projectsCount: number;
  onChangeTab: (tab: string) => void;
  onNewPost: () => void;
}

function TabShell({ children }: { children: ReactNode }) {
  return (
    <TabErrorBoundary>
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>{children}</Suspense>
    </TabErrorBoundary>
  );
}

export function AdminTabContent({
  activeTab,
  profileName,
  articlesCount,
  draftArticlesCount,
  projectsCount,
  onChangeTab,
  onNewPost,
}: AdminTabContentProps) {
  if (activeTab === "overview") {
    return (
      <TabShell>
        <OverviewTab
          profileName={profileName}
          articlesCount={articlesCount}
          draftArticlesCount={draftArticlesCount}
          projectsCount={projectsCount}
          onChangeTab={onChangeTab}
          onNewPost={onNewPost}
        />
      </TabShell>
    );
  }

  if (activeTab === "projects") {
    return (
      <TabShell>
        <ProjectsTab />
      </TabShell>
    );
  }

  if (activeTab === "writing") {
    return (
      <TabShell>
        <WritingTab />
      </TabShell>
    );
  }

  if (activeTab === "work") {
    return (
      <TabShell>
        <WorkTab />
      </TabShell>
    );
  }

  if (activeTab === "travel") {
    return (
      <TabShell>
        <TravelTab />
      </TabShell>
    );
  }

  if (activeTab === "reading") {
    return (
      <TabShell>
        <ReadingTab />
      </TabShell>
    );
  }

  if (activeTab === "media") {
    return (
      <TabShell>
        <MediaTab />
      </TabShell>
    );
  }

  if (activeTab === "seo") {
    return (
      <TabShell>
        <SEOTab />
      </TabShell>
    );
  }

  if (activeTab === "settings") {
    return (
      <TabShell>
        <SettingsTab />
      </TabShell>
    );
  }

  return null;
}

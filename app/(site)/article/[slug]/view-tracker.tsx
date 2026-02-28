"use client";

import { useEffect, useRef } from "react";

interface ArticleViewTrackerProps {
  slug: string;
}

export function ArticleViewTracker({ slug }: ArticleViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!slug || tracked.current) return;
    tracked.current = true;
    fetch(`/api/articles/slug/${slug}/view`, { method: "POST" }).catch(() => {});
  }, [slug]);

  return null;
}

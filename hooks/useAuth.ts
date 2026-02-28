"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data, status } = useSession();
  const user = data?.user;
  const isLoading = status === "loading";

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

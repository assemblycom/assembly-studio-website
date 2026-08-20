"use client";

import { createContext, useContext } from "react";
import type { PostRef } from "@/lib/ghost";

/**
 * The featured post, handed to the nav from the root layout.
 *
 * A context rather than a prop because the nav is rendered from four places
 * (the shell, the home hero, the proposal creator, the error boundary), only two
 * of which could plausibly fetch anything — threading a prop through all of them
 * would put a Ghost dependency in the error page's signature to satisfy a strip
 * it never shows.
 */
const FeaturedPostContext = createContext<PostRef | null>(null);

export function FeaturedPostProvider({
  post,
  children,
}: {
  post: PostRef | null;
  children: React.ReactNode;
}) {
  return (
    <FeaturedPostContext.Provider value={post}>
      {children}
    </FeaturedPostContext.Provider>
  );
}

export function useFeaturedPost(): PostRef | null {
  return useContext(FeaturedPostContext);
}

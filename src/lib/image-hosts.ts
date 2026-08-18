/**
 * Hosts next/image is allowed to optimise. Ghost stores most images itself, but
 * a feature image can point anywhere the author pasted from, and next/image
 * throws on an unconfigured host — which took out the whole page, not just the
 * picture. So this list is shared: next.config.ts allows these, and PostCover
 * falls back to a plain <img> for anything else rather than crashing.
 */
export const OPTIMIZED_IMAGE_HOSTS = [
  "images.ctfassets.net",
  "storage.ghost.io",
  "images.unsplash.com",
] as const;

export function isOptimizedHost(src: string): boolean {
  try {
    return (OPTIMIZED_IMAGE_HOSTS as readonly string[]).includes(
      new URL(src).hostname,
    );
  } catch {
    // A relative path is served by us, so it is always safe to optimise.
    return true;
  }
}

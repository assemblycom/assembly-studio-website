/**
 * The band above the nav. One announcement at a time, edited here rather than
 * fetched, so taking it down is a one-line change and never depends on the CMS
 * being reachable. Set to `null` when there is nothing to announce.
 */
/**
 * The band is one line at every width, so the copy has to fit one. Anything
 * longer is trimmed rather than allowed to wrap the bar into a paragraph —
 * the announcement is a pointer, and the post it points at carries the detail.
 */
export const MAX_ANNOUNCEMENT_WORDS = 8;

export const ANNOUNCEMENT: {
  text: string;
  /** Where the band goes. Internal routes only. */
  href: string;
  cta: string;
} | null = {
  text: "Introducing Assembly Studio, our AI app builder",
  href: "/blog/assembly-studio",
  cta: "Read now",
};

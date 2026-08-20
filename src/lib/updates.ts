/**
 * How many changelog entries one /updates page serves.
 *
 * Ten, which is what Notion's releases page settles on: an entry carries several
 * screenshots, so ten of them is already a long scroll. The blog's sixty is a
 * grid of cards, which is a different amount of page per item.
 *
 * Its own module because two places need to agree on it — the page that slices
 * the entries, and the sitemap that lists one URL per page of them.
 */
export const UPDATES_PER_PAGE = 10;

/** The path for a page of the changelog. Page one is the bare route. */
export function updatesPath(page: number): string {
  return page === 1 ? "/updates" : `/updates?page=${page}`;
}

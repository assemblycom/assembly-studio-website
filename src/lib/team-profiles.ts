import { FROZEN_TEAM } from "./team.frozen";

/**
 * The team on /about. These were Contentful `teamMembers` entries and are now
 * frozen beside this file, photographs included — a new hire is a commit here
 * rather than a CMS entry.
 */
export interface TeamProfile {
  name: string;
  /**
   * Contentful "About". A free-text line, and in practice it holds a role
   * ("Founder + CEO", "Adam is the Head of Sales and Partnerships at Assembly.")
   * on some entries and nothing on others — so it is optional and never
   * substituted with a guess.
   */
  about?: string;
  /** LinkedIn or X. */
  profileLink?: string;
  photo?: { url: string; alt: string; width: number; height: number };
}

export async function getTeam(): Promise<TeamProfile[]> {
  return FROZEN_TEAM;
}

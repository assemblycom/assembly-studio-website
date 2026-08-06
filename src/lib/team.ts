/**
 * Who a proposal can come from.
 *
 * A list rather than a free-text field: the sender is one of us, the recipient
 * sees the name on the page, and a typo or an inconsistent "Sean W." /
 * "Sean Walsh, Assembly" went out with it.
 *
 * Photos live in public/images/team, named after `value`; a missing file falls
 * back to the person's initials, so adding someone is one line and one image.
 *
 * Shared rather than local to the creator: the proposal link carries the name
 * only, so the page has to look the photo back up from it — see teamAvatar.
 */
export interface TeamMember {
  value: string;
  label: string;
  avatar: string;
}

export const TEAM: TeamMember[] = [
  { value: "sean", label: "Sean Walsh", avatar: "/images/team/sean.jpg" },
  {
    value: "vivienne",
    label: "Vivienne Chen",
    avatar: "/images/team/vivienne.jpg",
  },
  { value: "marlon", label: "Marlon Misra", avatar: "/images/team/marlon.jpg" },
  {
    value: "veronique",
    label: "Véronique Cadet",
    avatar: "/images/team/veronique.jpg",
  },
  {
    value: "jordan",
    label: "Jordan Wechsler",
    avatar: "/images/team/jordan.jpg",
  },
  { value: "adam", label: "Adam Schwartz", avatar: "/images/team/adam.jpg" },
  {
    value: "brittany",
    label: "Brittany Nickell",
    avatar: "/images/team/brittany.jpg",
  },
  { value: "dovid", label: "Dovid Baum", avatar: "/images/team/dovid.jpg" },
];

// The link carries the name, not the key: the proposal page prints whatever
// `from` says, and it has no idea this list exists.
export const teamOptions = TEAM.map(({ label, avatar }) => ({
  value: label,
  label,
  avatar,
}));

/**
 * The photo for a sender named in a proposal link, if they're one of us.
 * Matched on the name the creator writes into `from`, case-insensitively so a
 * hand-edited query still finds them. Undefined for anyone not on the list,
 * which draws their initials instead.
 */
export function teamAvatar(name: string): string | undefined {
  const key = name.trim().toLowerCase();
  return TEAM.find((member) => member.label.toLowerCase() === key)?.avatar;
}

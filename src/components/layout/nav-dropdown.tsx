"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavGroup, type NavEntry, type NavGroup } from "@/lib/constants";
import { useFeaturedPost } from "@/components/layout/featured-post";

// Pointer intent: leaving the trigger on the way to the panel shouldn't close
// it, and neither should crossing a neighbouring trigger at speed.
const CLOSE_DELAY_MS = 140;

// Marks the trigger row and the panel as one menu for the outside-click check.
// The panel is no longer a child of its trigger — it is a full-bleed sheet
// rendered at the header — so "inside the menu" can't be a single ref's subtree.
const MENU_ATTR = "data-nav-menu";

type MenuState = {
  /** Label of the group whose panel is open, or null when none is. */
  label: string | null;
  /** True when this open came straight off another open panel. */
  handoff: boolean;
};

type MenuContext = {
  state: MenuState;
  open: (label: string) => void;
  toggle: (label: string) => void;
  /** Close after the pointer-intent delay, unless something else opened since. */
  closeSoon: (label: string) => void;
  close: () => void;
};

const NavMenuContext = createContext<MenuContext | null>(null);

function useMenu(component: string): MenuContext {
  const menu = useContext(NavMenuContext);
  if (!menu) throw new Error(`${component} must be inside NavDropdownGroup`);
  return menu;
}

/**
 * Holds "which panel is open" for the whole nav row, so moving between two
 * triggers is one switch rather than two independent open/close animations
 * racing each other across different x positions.
 *
 * Wrap the header's whole content — the triggers AND the panel — since the two
 * are siblings rather than parent and child.
 */
export function NavDropdownGroup({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MenuState>({
    label: null,
    handoff: false,
  });
  const pathname = usePathname();
  // One timer for the row, not one per trigger: a per-trigger timer set on the
  // way out of Product would still be pending when Resources opened, and firing
  // it closed the panel the pointer was already inside.
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // A panel left open across a navigation would hang over the new page. Closed
  // during render off the route rather than in an effect, so the panel is gone
  // in the same paint that shows the new page.
  const [routeWhenOpened, setRouteWhenOpened] = useState(pathname);
  if (routeWhenOpened !== pathname) {
    setRouteWhenOpened(pathname);
    if (state.label) setState({ label: null, handoff: false });
  }

  const value = useMemo<MenuContext>(
    () => ({
      state,
      open: (label) => {
        clearTimeout(closeTimer.current);
        setState((prev) =>
          prev.label === label ? prev : { label, handoff: prev.label !== null },
        );
      },
      toggle: (label) => {
        clearTimeout(closeTimer.current);
        setState((prev) =>
          prev.label === label
            ? { label: null, handoff: false }
            : { label, handoff: prev.label !== null },
        );
      },
      closeSoon: (label) => {
        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => {
          // Anything that opened since this was scheduled owns the row now.
          setState((prev) =>
            prev.label === label ? { label: null, handoff: false } : prev,
          );
        }, CLOSE_DELAY_MS);
      },
      close: () => {
        clearTimeout(closeTimer.current);
        setState({ label: null, handoff: false });
      },
    }),
    [state],
  );

  // Escape and click-away live here rather than on each trigger: the panel sits
  // outside every trigger's subtree, so "did this land inside the menu" is a
  // question about the marked elements, not about one wrapper's descendants.
  const openLabel = state.label;
  useEffect(() => {
    if (!openLabel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") value.close();
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest?.(`[${MENU_ATTR}]`)) value.close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openLabel, value]);

  return (
    <NavMenuContext.Provider value={value}>{children}</NavMenuContext.Provider>
  );
}

/**
 * The bar's own ground while a panel is down.
 *
 * At rest the bar is transparent and the page runs under it, which is right
 * until a solid sheet drops out of its bottom edge: then the hero shows through
 * the bar and stops at a hard line where the sheet starts, and the two read as
 * two surfaces. This fills the bar with the sheet's own ground for as long as one
 * is open, so bar and sheet are one piece of paper. It sits under the bar's
 * contents (z-10) and over the frosted band (z-auto).
 */
export function NavBarFill() {
  const menu = useMenu("NavBarFill");
  const open = Boolean(menu.state.label);
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0 z-[5] h-full bg-background transition-opacity duration-150 ${
        open ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

/**
 * One grouped nav entry's trigger. The panel it opens is rendered by
 * NavMegaPanel at the header, so this is only the button and its hover intent.
 * Must sit inside NavDropdownGroup.
 */
export function NavDropdown({
  group,
  triggerClassName,
}: {
  group: NavGroup;
  triggerClassName: string;
}) {
  const menu = useMenu("NavDropdown");
  const open = menu.state.label === group.label;

  return (
    <div
      {...{ [MENU_ATTR]: "" }}
      onMouseEnter={() => menu.open(group.label)}
      onMouseLeave={() => menu.closeSoon(group.label)}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => menu.toggle(group.label)}
        className={triggerClassName}
      >
        {group.label}
      </button>
    </div>
  );
}

/**
 * The open group's panel: a full-bleed sheet dropping from under the bar, in the
 * shape Square and OpenAI use for theirs.
 *
 * It replaced a 296px popover card. A card floating under one trigger makes a
 * panel of three links feel like a context menu; the sheet gives the links room
 * to be read at heading size, lines its first column up with the logo on the
 * site's own rail, and leaves space beside them for what is new — which is the
 * whole reason to open a Resources menu rather than go straight to /blog.
 *
 * Renders as a child of the sticky <header> so `inset-x-0 top-full` resolves
 * against the bar: full viewport width, flush under it, no measuring.
 */
export function NavMegaPanel({
  entries,
  railClassName,
}: {
  entries: NavEntry[];
  /** The header's own rail, so the first column starts under the logo. */
  railClassName: string;
}) {
  const menu = useMenu("NavMegaPanel");
  const featured = useFeaturedPost();
  const openLabel = menu.state.label;

  const openGroup =
    entries.find(
      (entry): entry is NavGroup =>
        isNavGroup(entry) && entry.label === openLabel,
    ) ?? null;

  // The panel fades OUT as well as in, so it has to keep drawing the group it
  // was showing after that group stops being the open one.
  const [shown, setShown] = useState<NavGroup | null>(openGroup);
  if (openGroup && openGroup !== shown) setShown(openGroup);

  const open = Boolean(openGroup);
  // Handing off between triggers: the fade and the rise are there to introduce a
  // panel onto the page, and replaying them on every switch is what read as lag.
  // A sheet that is already down just changes what it holds.
  const instant = menu.state.handoff;

  if (!shown) return null;

  return (
    <div
      {...{ [MENU_ATTR]: "" }}
      onMouseEnter={() => menu.open(shown.label)}
      onMouseLeave={() => menu.closeSoon(shown.label)}
      // aria-hidden while closed so a screen reader doesn't read a sheet the
      // page has faded out; the trigger owns the expanded state.
      aria-hidden={!open}
      // z-20 puts the sheet above the bar's frosted band. That band is 135% of
      // the bar's height — it deliberately hangs ~22px past the bottom so the
      // blur eases off over the page — and with both at z-auto it was painting
      // its blurred copy of the page across the top of the sheet, which is the
      // shaded strip that made the two look unconnected.
      className={`absolute inset-x-0 top-full z-20 border-b border-border bg-background ${
        instant ? "" : "transition-[opacity,transform] duration-150"
      } ${
        open
          ? "pointer-events-auto translate-y-0 opacity-100"
          : `pointer-events-none opacity-0 ${instant ? "" : "-translate-y-1"}`
      } [[data-theme=dark]_&]:border-white/10`}
    >
      <div className={`mx-auto flex gap-20 ${railClassName} py-10`}>
        <div className="min-w-0">
          <p className="type-caption text-muted-foreground">{shown.label}</p>
          {/* Heading-size links on their own rows, the references' whole idea:
              at 15px in a card these were a list to scan, and at this size they
              are the four places you can go. No descriptions — a 13px line under
              36px type reads as a caption hung off a title. */}
          <ul className="mt-5 space-y-1">
            {shown.items.map((item) => {
              // Full ink at rest, dimming on hover — the way both references
              // treat theirs. Muted-at-rest read as a menu of things that were
              // unavailable once the type was this size.
              const cls =
                "type-h3 block text-foreground transition-colors hover:text-muted-foreground";
              return (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target={item.newTab ? "_blank" : undefined}
                      rel={item.newTab ? "noopener noreferrer" : undefined}
                      className={cls}
                      onClick={() => menu.close()}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={cls}
                      onClick={() => menu.close()}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* What is new, as its own column under its own label — the shape
            OpenAI's "Latest Advancements" takes beside its research links. Small
            type against the big column: it is the newest thing, not the most
            important one. */}
        {shown.showFeatured && featured && (
          <div className="min-w-0 max-w-xs">
            <p className="type-caption text-muted-foreground">Latest</p>
            <Link
              href={`/blog/${featured.slug}`}
              onClick={() => menu.close()}
              className="type-body mt-5 block text-foreground transition-colors hover:text-muted-foreground"
            >
              {featured.title}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

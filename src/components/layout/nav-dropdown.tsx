"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavGroup } from "@/lib/constants";

// Pointer intent: leaving the trigger on the way to the panel shouldn't close
// it, and neither should crossing a neighbouring trigger at speed.
const CLOSE_DELAY_MS = 140;

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

/**
 * Holds "which panel is open" for the whole nav row, so moving between two
 * triggers is one switch rather than two independent open/close animations
 * racing each other across different x positions.
 */
export function NavDropdownGroup({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MenuState>({ label: null, handoff: false });
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

  return (
    <NavMenuContext.Provider value={value}>{children}</NavMenuContext.Provider>
  );
}

/**
 * One grouped nav entry: a trigger that opens a panel of links, each with a
 * line saying what it is. Opens on hover and on click, closes on Escape, on a
 * click outside, and when the route changes. Must sit inside NavDropdownGroup.
 */
export function NavDropdown({
  group,
  triggerClassName,
}: {
  group: NavGroup;
  triggerClassName: string;
}) {
  const menu = useContext(NavMenuContext);
  if (!menu) throw new Error("NavDropdown must be inside NavDropdownGroup");

  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const open = menu.state.label === group.label;
  // Handing off between triggers: the fade and the 4px rise are there to
  // introduce a panel onto the page, and replaying them on every switch is what
  // read as lag and jitter. A menu that is already up just moves.
  const instant = menu.state.handoff;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") menu.close();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) menu.close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, menu]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => menu.open(group.label)}
      onMouseLeave={() => menu.closeSoon(group.label)}
      // Tabbing out of the last link should close it the way a click away does.
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) menu.close();
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => menu.toggle(group.label)}
        className={triggerClassName}
      >
        {group.label}
      </button>

      {/* The panel keeps the site's own surface tokens rather than following
          the bar's light-on-dark treatment: over a dark hero a translucent
          panel left the descriptions unreadable. It is the same popover the
          site's select menu uses — hairline border, low shadow, left-aligned
          so its labels sit on the trigger's own text edge. */}
      <div
        id={panelId}
        className={`absolute left-0 top-full z-50 w-[18.5rem] pt-2.5 ${
          instant ? "" : "transition-[opacity,transform] duration-150"
        } ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : `pointer-events-none opacity-0 ${instant ? "" : "-translate-y-1"}`
        }`}
      >
        <ul className="overflow-hidden rounded-lg border border-border bg-background p-1 shadow-[0_16px_44px_-26px_rgba(20,20,40,0.35)] [[data-theme=dark]_&]:bg-[#1c1c1c] [[data-theme=dark]_&]:border-white/10 [[data-theme=dark]_&]:shadow-[0_16px_44px_-22px_rgba(0,0,0,0.7)]">
          {group.items.map((item) => {
            const body = (
              <>
                <span className="block text-sm text-foreground">
                  {item.label}
                </span>
                {item.description && (
                  <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </>
            );
            const cls =
              "block rounded-md px-3 py-2 transition-colors hover:bg-muted [[data-theme=dark]_&]:hover:bg-white/[0.06]";

            return (
              <li key={item.href}>
                {item.external ? (
                  <a
                    href={item.href}
                    target={item.newTab ? "_blank" : undefined}
                    rel={item.newTab ? "noopener noreferrer" : undefined}
                    className={cls}
                  >
                    {body}
                  </a>
                ) : (
                  <Link href={item.href} className={cls}>
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

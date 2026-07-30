// ─────────────────────────────────────────────────────────────────────────
// MOCK FRAME — shared chrome for the "How it works" product mockups. On
// desktop it's a windowed app card; on mobile it's the shared PhoneShell
// device so the single main column (the mock hides its sidebar below sm) reads
// as a phone screen. Decorative only — children are the mock's inner layout.
// ─────────────────────────────────────────────────────────────────────────

import { PhoneShell } from "@/components/home/phone-shell";

export function MockFrame({ children }: { children: React.ReactNode }) {
  return (
    <div aria-hidden className="pointer-events-none select-none">
      {/* Mobile — iPhone-style device frame (shared with the production-gap
          comparison so every phone on the page reads the same). */}
      <div className="lg:hidden">
        <PhoneShell>{children}</PhoneShell>
      </div>

      {/* Desktop — windowed app card. A clearer ring + soft shadow lift it off
          the (same-colored) container so the UI reads as a distinct window. */}
      <div className="hidden w-full overflow-hidden rounded-lg bg-background ring-1 ring-black/[0.22] shadow-[0_1px_2px_rgba(16,24,40,0.05),0_10px_30px_-14px_rgba(16,24,40,0.16)] [[data-theme=dark]_&]:ring-white/[0.18] [[data-theme=dark]_&]:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.5)] lg:flex lg:aspect-[16/10] lg:flex-col">
        {children}
      </div>
    </div>
  );
}

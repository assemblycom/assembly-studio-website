import { DEMO_URL, TRUST_CENTER_URL } from "@/lib/constants";
import { CtaChipField, type CtaChip } from "@/components/ui/cta-chip-field";
import { Glyph } from "@/components/security/glyph";

// Security-flavored twist on the templates CTA: the floating chips name the
// platform's baked-in controls rather than app templates.
const CHIPS: CtaChip[] = [
  { label: "SOC 2 Type II", x: "10%", y: "22%", depth: 1, icon: <Glyph name="shield" size={16} /> },
  { label: "End-to-end encryption", x: "82%", y: "18%", depth: 0.9, icon: <Glyph name="lock" size={16} /> },
  { label: "HIPAA-ready", x: "18%", y: "74%", depth: 0.85, icon: <Glyph name="cross" size={16} /> },
  { label: "Role-based access", x: "86%", y: "70%", depth: 1, icon: <Glyph name="key" size={16} /> },
  { label: "Audit logs", x: "44%", y: "12%", depth: 0.45, blur: 2 },
  { label: "SSO & MFA", x: "60%", y: "88%", depth: 0.45, blur: 2 },
];

export function SecurityCta() {
  return (
    <CtaChipField chips={CHIPS}>
      <h2 className="type-display mx-auto max-w-2xl text-balance text-foreground">
        Build AI apps on a trusted platform
      </h2>
      <p className="type-lead mx-auto mt-5 max-w-xl text-pretty text-muted-foreground">
        Encryption, access controls, and certifications are engineered, audited,
        and on by default.
      </p>
      <div className="mx-auto mt-8 flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
        <a
          href={DEMO_URL}
          className="rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-[opacity,transform] hover:opacity-90 active:scale-[0.96]"
        >
          Book demo
        </a>
        <a
          href={TRUST_CENTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-foreground/20 bg-transparent px-5 py-2.5 text-center text-sm text-foreground transition-colors hover:bg-foreground/5"
        >
          Explore Trust Center
        </a>
      </div>
    </CtaChipField>
  );
}

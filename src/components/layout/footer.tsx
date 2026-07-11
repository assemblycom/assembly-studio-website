import Image from "next/image";
import Link from "next/link";
import { APP_URL, type NavLink } from "@/lib/constants";

const FOOTER_SECTIONS: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Security", href: "/security" },
      { label: "Docs", href: "#", disabled: true },
    ],
  },
  {
    title: "Company",
    links: [{ label: "Customers", href: "/customers" }],
  },
  {
    title: "Social",
    links: [
      { label: "X", href: "https://x.com", external: true },
      { label: "LinkedIn", href: "https://linkedin.com", external: true },
      { label: "Instagram", href: "https://instagram.com", external: true },
      { label: "YouTube", href: "https://youtube.com", external: true },
    ],
  },
];

export function Footer({ reveal = false }: { reveal?: boolean }) {
  // The landing page (reveal variant) is a dark sheet that lifts to reveal the
  // wordmark panel below; light contents, square corners. Every other page keeps
  // the neutral muted footer with dark contents.
  const heading = reveal ? "text-white" : "";
  const muted = reveal ? "text-white/50" : "text-muted-foreground";
  const linkHover = reveal ? "hover:text-white" : "hover:text-foreground";
  return (
    <footer
      className={reveal ? "bg-[#101010] text-white" : "bg-background"}
    >
      {/* Footer links */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            {/* Just the logo icon — no square, wordmark, or copy. */}
            <Image
              src="/images/logo-mark.svg"
              alt="Assembly Studio"
              width={28}
              height={28}
              className={reveal ? "invert" : ""}
            />
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className={`text-sm font-normal ${heading}`}>{section.title}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.disabled ? (
                      <span
                        aria-disabled="true"
                        className={`cursor-default text-sm ${muted}`}
                      >
                        {link.label}
                      </span>
                    ) : link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm ${muted} transition-colors ${linkHover}`}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className={`text-sm ${muted} transition-colors ${linkHover}`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* AI banner */}
      <div>
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-8">
          {/* Ask AI */}
          <div>
            <p className={`text-sm ${muted}`}>
              Ask AI about Assembly Studio
            </p>
            <div className="mt-3 flex items-center gap-2">
              {[
                { src: "/images/ai-chatgpt.svg", label: "ChatGPT" },
                { src: "/images/ai-claude.svg", label: "Claude" },
                { src: "/images/ai-gemini.svg", label: "Gemini" },
                { src: "/images/ai-vector.svg", label: "Grok" },
              ].map((ai) => (
                <a
                  key={ai.label}
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ask ${ai.label} about Assembly Studio`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-md"
                >
                  <Image
                    src={ai.src}
                    alt={ai.label}
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px] object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

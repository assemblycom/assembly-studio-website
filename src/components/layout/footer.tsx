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
      { label: "YouTube", href: "https://youtube.com", external: true },
    ],
  },
];

export function Footer({ rounded = false }: { rounded?: boolean }) {
  return (
    <footer
      className={`border-t border-border bg-muted ${
        rounded ? "rounded-b-[2.5rem]" : ""
      }`}
    >
      {/* Footer links */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/images/logo-full.svg"
              alt="Assembly Studio"
              width={160}
              height={20}
            />
            <p className="mt-3 text-sm text-muted-foreground">
              Build powerful AI workflows for your business.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-medium">{section.title}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.disabled ? (
                      <span
                        aria-disabled="true"
                        className="cursor-default text-sm text-muted-foreground"
                      >
                        {link.label}
                      </span>
                    ) : link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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

      {/* AI + Demo banner */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 md:flex-row md:items-center md:justify-between">
          {/* Ask AI */}
          <div>
            <p className="text-sm text-muted-foreground">
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
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:border-foreground/20"
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

          {/* Watch Demo */}
          <a
            href={APP_URL}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted-foreground/20" />
            <span className="text-sm font-medium">Watch Demo</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

import Image from "next/image";
import Link from "next/link";
import { APP_URL, DOCS_URL } from "@/lib/constants";

const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Security", href: "/security" },
      { label: "Docs", href: DOCS_URL, external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Customers", href: "/customers" },
      { label: "About", href: "https://assembly.com", external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer>
      {/* Dark banner — AI + Demo */}
      <div className="bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row md:items-center md:justify-between">
          {/* Ask AI */}
          <div>
            <p className="text-sm text-background/60">
              Ask AI about Assembly Studio
            </p>
            <div className="mt-3 flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/10"
                >
                  <div className="h-4 w-4 rounded-full bg-background/30" />
                </div>
              ))}
            </div>
          </div>

          {/* Watch Demo */}
          <a
            href={APP_URL}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="h-10 w-10 overflow-hidden rounded-full bg-background/20" />
            <span className="text-sm font-medium">Watch Demo</span>
          </a>
        </div>
      </div>

      {/* Footer links */}
      <div className="border-t border-border bg-muted">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
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
                    <li key={link.href}>
                      {link.external ? (
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
      </div>
    </footer>
  );
}

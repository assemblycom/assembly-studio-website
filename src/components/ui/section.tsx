import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className = "", id }: SectionProps) {
  // cn() (tailwind-merge) so a caller's padding override actually wins over the
  // defaults rather than fighting them in the cascade.
  return (
    <section id={id} className={cn("px-6 py-28 md:py-44", className)}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

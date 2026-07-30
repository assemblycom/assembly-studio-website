import { Section } from "@/components/ui/section";

// Temporary stand-in for a landing section that's designed but not built yet —
// holds its slot in the page order so the narrative flow can be reviewed.
export function SectionPlaceholder({
  id,
  title,
  note,
}: {
  id: string;
  title: string;
  note: string;
}) {
  return (
    <Section id={id}>
      <h2 className="type-h2 text-foreground">{title}</h2>
      <div
        className="mt-10 flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40"
        style={{ aspectRatio: "16 / 6" }}
      >
        <p className="max-w-md px-6 text-center text-[15px] leading-relaxed text-muted-foreground">
          {note}
        </p>
      </div>
    </Section>
  );
}

// Parallel `modal` slot for the Notion-style template detail overlay — filled
// by @modal/(.)[slug] when a template is opened from the grid, empty otherwise.
export default function TemplatesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

import type { ReactNode } from 'react';

// Repeats identically across every tab in Figma's "Details view" (Overview, Admission,
// Opening hours, Getting there, Contact details, Other places you can visit) - just a title
// + content, so it stays a plain local layout rather than a new design-system component.
// Figma's section header also carries a row of 3 identical, unlabeled small icons next to
// the title with no distinguishing content or component description anywhere in the file -
// they're left out here rather than guessed at.
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-h3 text-foreground">{title}</h3>
      {children}
    </div>
  );
}

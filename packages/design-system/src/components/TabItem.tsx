import type { ButtonHTMLAttributes, ReactNode } from 'react';

// Ported from Figma ("tab item" atom, node 309:3762) and the composed "tabs" example
// (node 349:7447). Figma's "state" variant (default/active) and its three visual styles
// (pill / rounded-pill / underline) collapse into `active`/`variant` props here since all
// three share the same interaction model - only the at-rest look differs, not the behavior.
// `rounded` is otherwise identical to `pills` (same container/active-pill treatment), just
// with `rounded-full` corners instead of `rounded-md`/`rounded-lg` - Figma's own "tabs"
// example places both side by side with no other difference between them.
//
// Meant to be dropped into a Base UI `Tabs.Tab` via `render` (mirrors `MenuItem`/
// `Menu.Item`): Base UI owns selection/keyboard nav and merges its own `data-active`/
// `disabled` attributes onto whatever root element this renders, which is why the active
// styling below is driven by the `data-[active]:`/`group-data-[active]:` attribute variants
// rather than a prop check. `data-[active]:text-subtle-medium` still safely overrides the
// base `text-subtle` font-weight/size despite both being plain classes, because Tailwind
// compiles the attribute variant into a class+attribute compound selector, which outranks
// the single-class `text-subtle` selector on specificity.
//
// The `active` prop only exists so this atom can be demoed/used standalone outside a Tabs
// context (e.g. Storybook) - it just sets the same `data-active` attribute Base UI would.
export interface TabItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: 'pills' | 'rounded' | 'line';
  /** Only needed for standalone/demo usage - a real `Tabs.Tab` drives this itself. */
  active?: boolean;
}

export function TabItem({ children, variant = 'pills', active, className, ...props }: TabItemProps) {
  if (variant === 'line') {
    return (
      <button
        type="button"
        data-active={active || undefined}
        className={`group inline-flex flex-col items-center gap-1.5 disabled:pointer-events-none disabled:opacity-60 ${className ?? ''}`}
        {...props}
      >
        <span className="text-subtle text-muted-foreground transition-colors [font-family:var(--font-geist)] group-data-[active]:text-subtle-medium group-data-[active]:text-foreground">
          {children}
        </span>
        <span className="h-0.5 w-full rounded-full bg-transparent transition-colors group-data-[active]:bg-primary" />
      </button>
    );
  }

  const radius = variant === 'rounded' ? 'rounded-full' : 'rounded-md';

  return (
    <button
      type="button"
      data-active={active || undefined}
      className={`inline-flex items-center justify-center whitespace-nowrap ${radius} px-4 py-1.5 text-subtle text-muted-foreground transition-colors [font-family:var(--font-geist)] data-[active]:bg-background data-[active]:text-subtle-medium data-[active]:text-foreground data-[active]:shadow-[0px_2px_4px_rgba(0,0,0,0.08)] disabled:pointer-events-none disabled:opacity-60 ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

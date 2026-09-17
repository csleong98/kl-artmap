import type { HTMLAttributes, ReactNode } from 'react';
import { CaretRight } from '@phosphor-icons/react';

// Ported from Figma (KL Art Map, "MenuItemAtom" node 303:2121). Figma's "state" prop
// (default/hover/disabled) collapses into real interaction states here: `:hover` for mouse,
// plus `data-[highlighted]` for the moment this is dropped into a Base UI `Menu.Item` (which
// sets that attribute on both mouse hover AND keyboard arrow-navigation - plain `:hover`
// alone wouldn't cover the keyboard case). `disabled` is a real prop, not a style variant.
// One thing NOT ported: Figma's hover-state shortcut text switches font from Geist to Inter,
// while every other state keeps Geist - that reads as a Figma authoring slip (a font flicker
// on hover would be a genuine UX bug), so the shortcut stays Geist across all states here.
export interface MenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  icon?: ReactNode;
  label: ReactNode;
  shortcut?: ReactNode;
  /** `true` shows the default CaretRight (submenu indicator); pass a node to override. */
  trailingIcon?: ReactNode | boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function MenuItem({
  icon,
  label,
  shortcut,
  trailingIcon,
  disabled,
  className,
  onClick,
  ...props
}: MenuItemProps) {
  return (
    <div
      role="menuitem"
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium leading-5 text-foreground transition-colors [font-family:var(--font-geist)] ${
        disabled
          ? 'pointer-events-none text-muted-foreground opacity-60'
          : 'hover:bg-secondary data-[highlighted]:bg-secondary'
      } ${className ?? ''}`}
      {...props}
    >
      {icon && <span className="size-4 shrink-0">{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {shortcut && (
        <span className="shrink-0 text-xs font-medium leading-5 text-muted-foreground [font-family:var(--font-geist)]">
          {shortcut}
        </span>
      )}
      {trailingIcon && (
        <span className="size-4 shrink-0">
          {trailingIcon === true ? <CaretRight weight="regular" /> : trailingIcon}
        </span>
      )}
    </div>
  );
}

export function MenuSectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-center px-2 py-1.5">
      <p className="flex-1 text-xs font-medium leading-5 text-muted-foreground [font-family:var(--font-geist)]">
        {children}
      </p>
    </div>
  );
}

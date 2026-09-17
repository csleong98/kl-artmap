import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Ported from Figma (KL Art Map, "IconOnly" node 300:1816). Figma's "type" prop is
// renamed "variant" for consistency with `Button`. This is a separate component from
// `Button` (not a `Button` size) because its shape rules differ from `Button` entirely:
// - "outline" and "ghost" share the same white/secondary-gray background and only
//   differ by the border - unlike `Button`'s ghost, which starts fully transparent.
// - radius="rounded" is a true 96px/full circle here (Tailwind `rounded-full`), not
//   `Button`'s 24px pill - Figma sizes this as a fixed square, not text-driven width.
// - There's no primary/secondary/destructive/link equivalent; Figma only defines
//   outline and ghost for icon-only buttons.
// Note: this is unrelated to `Button`'s own `size="icon"`, which exists so icon-only
// buttons can sit inside a `ButtonGroup` alongside text buttons and match their height -
// that one is always bordered/squared to match the group, never standalone or circular.
const iconButtonVariants = cva(
  'inline-flex items-center justify-center shrink-0 bg-background text-secondary-foreground transition-[filter,background-color] hover:bg-secondary disabled:opacity-50 disabled:pointer-events-none [&_svg]:size-4',
  {
    variants: {
      variant: {
        outline: 'border border-border',
        ghost: '',
      },
      // Explicit size, not padding - see the comment on Button's size variants for why:
      // padding-driven auto-height adds the border on top of the total, so a bordered
      // ("outline") and borderless ("ghost") button of the same nominal size would
      // otherwise render 2px apart. An explicit size draws the border inside the box.
      size: {
        default: 'size-10',
        sm: 'size-8',
      },
      radius: {
        squared: 'rounded-md',
        rounded: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'sm',
      radius: 'squared',
    },
  }
);

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof iconButtonVariants> {
  icon: ReactNode;
  /** Required - this button never renders a visible label. */
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, radius, icon, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={iconButtonVariants({ variant, size, radius, className })}
        {...props}
      >
        {icon}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

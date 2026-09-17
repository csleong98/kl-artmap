import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Ported from Figma (KL Art Map, node 290:2359). Adapted for real usage:
// - Figma's "type" prop is renamed "variant" - it would otherwise collide with the
//   native <button type="submit|button|reset"> attribute.
// - Figma's "leadingIcon"/"trailingIcon" booleans (which always rendered a hardcoded
//   envelope/caret in the design file, just to preview the variant) become real
//   ReactNode props so callers can pass any icon.
// - Figma bakes "hover" as a separate variant; here it's a real CSS :hover state.
// - Button label font is Inter per Figma, which differs from the Geist-based
//   text-body-medium/text-p-ui-medium tokens used elsewhere - kept as-is to match
//   the source file; worth reconciling with the user if that's not intentional.
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium leading-6 transition-[filter,background-color] disabled:opacity-50 disabled:pointer-events-none [font-family:var(--font-inter)]',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground gap-2 hover:brightness-110',
        secondary: 'bg-secondary text-secondary-foreground gap-2.5 hover:brightness-95',
        outline: 'border border-border text-secondary-foreground gap-2.5 hover:bg-neutral-100',
        ghost: 'bg-transparent text-secondary-foreground gap-2.5 hover:bg-secondary',
        link: 'bg-transparent text-link gap-2.5 hover:underline',
        destructive: 'bg-destructive text-destructive-foreground gap-2 hover:brightness-110',
      },
      // Every size sets an explicit height rather than relying on line-height/padding to
      // produce one. Auto-height always adds the border ON TOP of content+padding (border-box
      // only changes how an *explicit* size is interpreted, not how auto-sizing is computed),
      // so a padding-driven button and a fixed-size icon button never land on the same total
      // even when their padding math "should" match. An explicit height sidesteps that: the
      // border is drawn inside the box, so bordered and borderless variants of the same size
      // are pixel-identical, and text/icon buttons of the same size always match.
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3',
        xs: 'h-6 px-2',
        icon: 'size-8',
      },
      radius: {
        squared: 'rounded-md',
        rounded: 'rounded-[24px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      radius: 'squared',
    },
  }
);

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof buttonVariants> {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, radius, leadingIcon, trailingIcon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, radius, className })}
        {...props}
      >
        {leadingIcon && <span className="shrink-0 size-4">{leadingIcon}</span>}
        {children}
        {trailingIcon && <span className="shrink-0 size-4">{trailingIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Ported from Figma (KL Art Map, "ButtonGroupAtoms" node 317:4758 + "ButtonGroup" node 317:4869).
// Figma modeled this as a combinatorial set of "atom" frames (one per position/state/radius/type
// combination) each carrying its own full border and background. Porting that 1:1 would mean
// re-deriving Button's own outline styling inside a second component - the atom's colors
// (white bg, border, secondary-foreground text, neutral-100 hover) are exactly the existing
// `Button` "outline" variant. So instead, ButtonGroup is a thin wrapper: it expects `Button`
// (variant="outline") children and uses CSS child-selectors to collapse the shared borders
// between adjacent buttons and round only the outer corners - the standard pattern for
// segmented button groups, and the only sane approach without cloning/inspecting children.
const buttonGroupVariants = cva(
  'inline-flex [&>button]:rounded-none [&>button]:relative [&>button:hover]:z-10 [&>button:focus-visible]:z-10',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row [&>button:not(:first-child)]:-ml-px',
        vertical: 'flex-col [&>button:not(:first-child)]:-mt-px',
      },
      radius: {
        squared: '',
        rounded: '',
      },
    },
    compoundVariants: [
      {
        orientation: 'horizontal',
        radius: 'squared',
        class: '[&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md',
      },
      {
        orientation: 'horizontal',
        radius: 'rounded',
        class: '[&>button:first-child]:rounded-l-[24px] [&>button:last-child]:rounded-r-[24px]',
      },
      {
        orientation: 'vertical',
        radius: 'squared',
        class: '[&>button:first-child]:rounded-t-md [&>button:last-child]:rounded-b-md',
      },
      {
        orientation: 'vertical',
        radius: 'rounded',
        class: '[&>button:first-child]:rounded-t-[24px] [&>button:last-child]:rounded-b-[24px]',
      },
    ],
    defaultVariants: {
      orientation: 'horizontal',
      radius: 'squared',
    },
  }
);

export interface ButtonGroupProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {
  children: ReactNode;
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation, radius, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        className={buttonGroupVariants({ orientation, radius, className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ButtonGroup.displayName = 'ButtonGroup';

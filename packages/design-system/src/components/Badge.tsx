import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Ported from Figma (KL Art Map, "Badge" node 334:2484). Figma's "type" prop is renamed
// "color" here since "variant" is already taken by the outline/accented/default style axis.
// Every color/style combination below reuses an existing semantic token - see
// tokens.generated.css - except secondary's "accented" text, which Figma sets to a plain
// neutral-600 rather than a token; kept as-is since it's applied consistently, not a
// one-off slip. Padding is derived from icon presence rather than a cva variant, since
// it's a direct consequence of the icon slot, not an independent design choice.
const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-xl py-0.5 text-xs font-medium leading-5 [font-family:var(--font-geist)] [&_svg]:size-3',
  {
    variants: {
      color: {
        primary: '',
        secondary: '',
        destructive: '',
        success: '',
        warning: '',
        info: '',
      },
      variant: {
        default: '',
        accented: '',
        outline: 'border',
      },
    },
    compoundVariants: [
      { color: 'primary', variant: 'default', className: 'bg-primary text-primary-foreground' },
      { color: 'primary', variant: 'accented', className: 'bg-accent text-brand-700' },
      { color: 'primary', variant: 'outline', className: 'border-primary bg-background text-primary' },

      { color: 'secondary', variant: 'default', className: 'bg-secondary text-secondary-foreground' },
      { color: 'secondary', variant: 'accented', className: 'bg-secondary text-neutral-600' },
      { color: 'secondary', variant: 'outline', className: 'border-muted-foreground bg-secondary text-secondary-foreground' },

      { color: 'destructive', variant: 'default', className: 'bg-destructive text-destructive-foreground' },
      { color: 'destructive', variant: 'accented', className: 'bg-destructive-foreground text-destructive' },
      { color: 'destructive', variant: 'outline', className: 'border-destructive bg-background text-destructive' },

      { color: 'success', variant: 'default', className: 'bg-success text-success-foreground' },
      { color: 'success', variant: 'accented', className: 'bg-success-foreground text-success' },
      { color: 'success', variant: 'outline', className: 'border-success bg-background text-success' },

      { color: 'warning', variant: 'default', className: 'bg-warning text-warning-foreground' },
      { color: 'warning', variant: 'accented', className: 'bg-warning-foreground text-warning' },
      { color: 'warning', variant: 'outline', className: 'border-warning bg-background text-warning' },

      { color: 'info', variant: 'default', className: 'bg-info text-info-foreground' },
      { color: 'info', variant: 'accented', className: 'bg-info-foreground text-info' },
      { color: 'info', variant: 'outline', className: 'border-info bg-background text-info' },
    ],
    defaultVariants: { color: 'primary', variant: 'default' },
  }
);

export interface BadgeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof badgeVariants> {
  icon?: ReactNode;
}

export function Badge({ className, color, variant, icon, children, ...props }: BadgeProps) {
  return (
    <div
      className={`${badgeVariants({ color, variant })} ${icon ? 'gap-1 pl-1.5 pr-2' : 'px-2'} ${className ?? ''}`}
      {...props}
    >
      {icon}
      {children}
    </div>
  );
}

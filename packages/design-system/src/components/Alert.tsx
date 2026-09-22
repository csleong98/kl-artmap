import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Question } from '@phosphor-icons/react';

// Ported from Figma (KL Art Map, "Alert" node 352:7969). Figma's "type" prop is renamed
// "variant" for consistency with `Button`. The trailing button in Figma is styled exactly
// like `Button`'s existing primary/outline/destructive variants (down to the gap-2 vs
// gap-2.5 spacing quirk) - rather than re-implementing that here, `action` is a slot the
// caller fills with a real `<Button size="xs">`, matching the `ButtonGroup` composition
// pattern. All three variants' colors map onto existing semantic tokens with no new tokens
// needed - notably "destructive" uses `destructive-foreground` (red-50) as its *background*
// and `destructive` (red-600) as its text, the inverse of how `Button` uses that pair.
const alertVariants = cva(
  'flex w-full items-start gap-2 rounded-[10px] border px-2.5 py-2 text-sm leading-6 [font-family:var(--font-geist)]',
  {
    variants: {
      variant: {
        accent: 'bg-accent border-brand-300 text-accent-foreground',
        default: 'bg-background border-separator text-foreground',
        destructive: 'bg-destructive-foreground border-red-300 text-destructive',
      },
    },
    defaultVariants: {
      variant: 'accent',
    },
  }
);

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>, VariantProps<typeof alertVariants> {
  /** Pass `false` to hide the icon entirely. Defaults to a generic Question icon. */
  icon?: ReactNode | false;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function Alert({ className, variant, icon, title, description, action, ...props }: AlertProps) {
  return (
    <div className={alertVariants({ variant, className })} {...props}>
      {icon !== false && (
        <div className="shrink-0 pt-1">
          {icon ?? <Question className="size-4" weight="regular" />}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="w-full font-medium">{title}</p>
        {description && (
          <p className={`w-full font-normal ${variant === 'destructive' ? '' : 'text-muted-foreground'}`}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

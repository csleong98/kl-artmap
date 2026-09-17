import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Ported from Figma (KL Art Map, "Input" node 302:1996). Figma authors "default"/"completed"/
// "focused"/"disabled" as four separate variants of the field, but those are really just what
// a plain <input> looks like at rest, with a value typed in, focused, and disabled - the browser
// already switches between them for free. So instead of a `state` prop, this uses real input
// semantics: `::placeholder` for the empty/"default" look, `:focus-visible` for the ring (a
// native `ring`/`ring-offset` box-shadow, not Figma's nested "ring wrapper" frame - visually
// equivalent, far less markup), and the native `disabled` attribute + `peer-disabled` so the
// helper text dims along with the field like Figma does (the label does not dim, matching Figma).
// The `size="small"` placeholder is Inter per Figma while every other text role here is Geist -
// kept as-is to match the source file; worth reconciling with the user if that's not intentional.
// Figma also gives both sizes the identical pl-[12px] pr-[56px] py-[8px] field padding - only the
// font size changes between "default" and "small" - preserved faithfully even though it's a bit
// surprising for a "small" size to keep default-sized padding.
const inputVariants = cva(
  'w-full border border-border bg-background text-foreground placeholder:text-input transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:pointer-events-none pl-3 pr-14 py-2 [font-family:var(--font-geist)]',
  {
    variants: {
      size: {
        default: 'text-base leading-6',
        small: 'text-sm leading-5 [font-family:var(--font-inter)]',
      },
      radius: {
        squared: 'rounded-md',
        rounded: 'rounded-[24px]',
      },
    },
    defaultVariants: {
      size: 'default',
      radius: 'squared',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: ReactNode;
  helperText?: ReactNode;
  labelPosition?: 'top' | 'left';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, radius, label, helperText, labelPosition = 'top', id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const isLabelLeft = labelPosition === 'left';

    return (
      <div className="flex w-full flex-col items-start gap-1.5">
        <div className={isLabelLeft ? 'flex w-full items-center gap-4' : 'flex w-full flex-col items-start gap-1.5'}>
          {label && (
            <label
              htmlFor={inputId}
              className={`shrink-0 text-sm font-medium leading-5 text-foreground [font-family:var(--font-geist)] ${isLabelLeft ? 'w-[84px]' : ''}`}
            >
              {label}
            </label>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={inputVariants({ size, radius, className })}
            {...props}
          />
        </div>
        {helperText && (
          <p
            className={`text-sm font-normal leading-5 text-muted-foreground [font-family:var(--font-geist)] ${disabled ? 'opacity-60' : ''}`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

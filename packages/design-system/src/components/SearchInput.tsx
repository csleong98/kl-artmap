import { forwardRef, useRef, type InputHTMLAttributes, type Ref } from 'react';
import { MagnifyingGlass, XCircle } from '@phosphor-icons/react';

// Ported from Figma (KL Art Map, "InputSearch" node 304:2338). Figma's "default"/"active"
// states just mean "empty" vs. "has a value" - handled here with the native
// `:placeholder-shown` pseudo-class (via Tailwind's `peer-placeholder-shown`) rather than a
// prop, so the clear button appears/disappears automatically whether the input is controlled
// or uncontrolled. Figma also gives the empty state a huge pr-[56px] (vs. symmetric px-[12px]
// once there's a clear button) - replicating that would shift the field's padding as soon as
// you type, so this uses one consistent padding throughout instead.
//
// `radius` mirrors `Input`'s own `squared`/`rounded` scale (`rounded-[24px]`) rather than
// inventing a second one, so the two field types stay visually consistent wherever they
// appear together.
function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  onClear?: () => void;
  radius?: 'squared' | 'rounded';
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, placeholder = 'Type something to search', onClear, radius = 'squared', ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLInputElement>(null);

    const handleClear = () => {
      const input = innerRef.current;
      if (input) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        nativeSetter?.call(input, '');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
      }
      onClear?.();
    };

    return (
      <div
        className={`flex w-full items-center gap-1 border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background ${
          radius === 'rounded' ? 'rounded-[24px]' : 'rounded-md'
        }`}
      >
        <MagnifyingGlass className="size-4 shrink-0 text-input" weight="regular" />
        <input
          ref={mergeRefs(innerRef, forwardedRef)}
          type="text"
          placeholder={placeholder}
          className={`peer min-w-0 flex-1 bg-transparent text-base leading-6 text-foreground placeholder:text-input focus:outline-none [font-family:var(--font-geist)] ${className ?? ''}`}
          {...props}
        />
        <button
          type="button"
          aria-label="Clear search"
          onClick={handleClear}
          className="flex shrink-0 items-center justify-center text-input transition-colors hover:text-secondary-foreground peer-placeholder-shown:hidden"
        >
          <XCircle className="size-4" weight="fill" />
        </button>
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

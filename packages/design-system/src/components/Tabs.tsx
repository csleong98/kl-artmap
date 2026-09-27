import { createContext, useContext, type ReactElement, type ReactNode } from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { TabItem } from './TabItem';

// The composed wrapper, built from the `TabItem` atom on top of Base UI's Tabs primitive
// (Root/List/Tab/Panel), which supplies role="tablist"/"tab"/"tabpanel", keyboard
// arrow-key navigation, and the `value`/`defaultValue`/`onValueChange` selection state that
// `TabItem` itself has no notion of. `variant` ('pills' | 'rounded' | 'line') is set once on
// `Tabs` and threaded to every `Tabs.Tab` via context, so callers don't repeat it per tab -
// matching how Figma's composed "tabs" example (node 349:7447) is one consistent style per
// row, not a per-tab choice.
//
// `width` is threaded the same way: `hug` (the default, and Figma's component) sizes each
// tab to its own label; `fill` stretches the row to its container and splits it evenly
// between tabs - what the detail pages' tab rows use, where a hugging row would leave a
// ragged empty end. Both stay available since a short row of tabs in a toolbar still wants
// to hug its content.
type TabsVariant = 'pills' | 'rounded' | 'line';
type TabsWidth = 'hug' | 'fill';

const TabsVariantContext = createContext<{ variant: TabsVariant; width: TabsWidth }>({
  variant: 'pills',
  width: 'hug',
});

export interface TabsProps {
  variant?: TabsVariant;
  /** `hug` sizes tabs to their labels; `fill` spreads them evenly across the full width. @default 'hug' */
  width?: TabsWidth;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ variant = 'pills', width = 'hug', children, className, ...rootProps }: TabsProps) {
  return (
    <BaseTabs.Root className={className} {...rootProps}>
      <TabsVariantContext.Provider value={{ variant, width }}>{children}</TabsVariantContext.Provider>
    </BaseTabs.Root>
  );
}

function List({ children, className }: { children: ReactNode; className?: string }) {
  const { variant, width } = useContext(TabsVariantContext);
  const containerRadius = variant === 'rounded' ? 'rounded-full' : 'rounded-lg';
  const display = width === 'fill' ? 'flex w-full' : 'inline-flex';
  return (
    <BaseTabs.List
      className={
        variant === 'line'
          ? `${display} items-center gap-6 ${className ?? ''}`
          : `${display} ${width === 'fill' ? '' : 'w-fit'} items-center gap-1 ${containerRadius} bg-secondary p-1 ${className ?? ''}`
      }
    >
      {children}
    </BaseTabs.List>
  );
}

export interface TabProps {
  value: string;
  children: ReactNode;
  /** Off by default - pass to opt this tab into a leading icon. */
  icon?: ReactElement<{ weight?: string }>;
  disabled?: boolean;
  className?: string;
}

function Tab({ value, children, icon, disabled, className }: TabProps) {
  const { variant, width } = useContext(TabsVariantContext);
  return (
    <BaseTabs.Tab
      value={value}
      disabled={disabled}
      render={
        <TabItem variant={variant} icon={icon} className={`${width === 'fill' ? 'min-w-0 flex-1' : ''} ${className ?? ''}`}>
          {children}
        </TabItem>
      }
    />
  );
}

function Panel({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  return (
    <BaseTabs.Panel value={value} className={className}>
      {children}
    </BaseTabs.Panel>
  );
}

Tabs.List = List;
Tabs.Tab = Tab;
Tabs.Panel = Panel;

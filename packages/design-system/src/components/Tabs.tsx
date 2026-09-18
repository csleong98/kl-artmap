import { createContext, useContext, type ReactNode } from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { TabItem } from './TabItem';

// The composed wrapper, built from the `TabItem` atom on top of Base UI's Tabs primitive
// (Root/List/Tab/Panel), which supplies role="tablist"/"tab"/"tabpanel", keyboard
// arrow-key navigation, and the `value`/`defaultValue`/`onValueChange` selection state that
// `TabItem` itself has no notion of. `variant` ('pills' | 'rounded' | 'line') is set once on
// `Tabs` and threaded to every `Tabs.Tab` via context, so callers don't repeat it per tab -
// matching how Figma's composed "tabs" example (node 349:7447) is one consistent style per
// row, not a per-tab choice.
type TabsVariant = 'pills' | 'rounded' | 'line';

const TabsVariantContext = createContext<TabsVariant>('pills');

export interface TabsProps {
  variant?: TabsVariant;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ variant = 'pills', children, className, ...rootProps }: TabsProps) {
  return (
    <BaseTabs.Root className={className} {...rootProps}>
      <TabsVariantContext.Provider value={variant}>{children}</TabsVariantContext.Provider>
    </BaseTabs.Root>
  );
}

function List({ children, className }: { children: ReactNode; className?: string }) {
  const variant = useContext(TabsVariantContext);
  const containerRadius = variant === 'rounded' ? 'rounded-full' : 'rounded-lg';
  return (
    <BaseTabs.List
      className={
        variant === 'line'
          ? `inline-flex items-center gap-6 ${className ?? ''}`
          : `inline-flex w-fit items-center gap-1 ${containerRadius} bg-secondary p-1 ${className ?? ''}`
      }
    >
      {children}
    </BaseTabs.List>
  );
}

export interface TabProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

function Tab({ value, children, disabled, className }: TabProps) {
  const variant = useContext(TabsVariantContext);
  return (
    <BaseTabs.Tab
      value={value}
      disabled={disabled}
      render={
        <TabItem variant={variant} className={className}>
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

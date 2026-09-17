import type { ReactElement, ReactNode } from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { MenuItem as MenuItemAtom, MenuSectionTitle, type MenuItemProps } from './MenuItem';

// The composed dropdown menu, built from the `MenuItem`/`MenuSectionTitle` atoms (Figma node
// 303:2121) on top of Base UI's Menu primitive (Root/Trigger/Portal/Positioner/Popup/Item),
// which supplies the role="menu" container, keyboard arrow-key navigation, open/close on
// outside click and Escape, and the `data-highlighted` state `MenuItem` already styles for.
// Figma only specifies the row atoms, not a container - the popup's width (236px, matching
// the atom's own Figma width), border, and shadow are this component's own addition, not
// pulled from a specific Figma frame.
export interface MenuProps {
  /** The element that opens the menu - must be a single element (e.g. an `IconButton`). */
  trigger: ReactElement;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

export function Menu({ trigger, children, side = 'bottom', align = 'start' }: MenuProps) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner side={side} align={align} sideOffset={4}>
          <BaseMenu.Popup className="w-[236px] rounded-lg border border-border bg-background p-1 shadow-lg outline-none">
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

function Item({ closeOnClick = true, ...props }: MenuItemProps & { closeOnClick?: boolean }) {
  return (
    <BaseMenu.Item
      disabled={props.disabled}
      closeOnClick={closeOnClick}
      render={<MenuItemAtom {...props} />}
    />
  );
}

function Group({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <BaseMenu.Group>
      <BaseMenu.GroupLabel render={<MenuSectionTitle>{label}</MenuSectionTitle>} />
      {children}
    </BaseMenu.Group>
  );
}

Menu.Item = Item;
Menu.Group = Group;

import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { TimelineItem, type TimelineItemProps } from './TimelineItem';

// The composed wrapper from the "route" example (node 373:24336): renders a list of
// `Timeline.Item`s and inserts the 40px connector segment between each pair automatically
// (never after the last one), and tells each item whether to draw its own internal
// connecting line via `connectToNext` - which Figma's own composed frame also does by hand
// for its last entry, so this isn't a simplification, it's just automating what the design
// already does per-item rather than leaving every consumer to recompute "is this the last
// item" themselves.
export interface TimelineProps {
  /** `Timeline.Item` elements. */
  children: ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<TimelineItemProps>[];

  return (
    <div className={`flex w-full flex-col items-start ${className ?? ''}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={item.key ?? index}>
            {cloneElement(item, { connectToNext: !isLast })}
            {!isLast && <TimelineConnector />}
          </Fragment>
        );
      })}
    </div>
  );
}

function TimelineConnector() {
  return (
    <div className="flex h-10 w-full shrink-0 items-stretch pl-4">
      <div className="flex w-8 items-center justify-center">
        <div className="h-full w-px bg-border" />
      </div>
    </div>
  );
}

Timeline.Item = TimelineItem;

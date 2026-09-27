import { Flag, Sparkle } from '@phosphor-icons/react';
import { Timeline } from 'design-system';
import { LOCATION_HISTORY } from '@/data/locationHistory';
import type { Location } from '@/types';
import { Section } from './Section';

export function HistoryTab({ location, mobile = false }: { location: Location; /** 16px section spacing (Figma mobile) instead of 32px. */ mobile?: boolean }) {
  const description = location.details?.overview.description;
  const milestones = LOCATION_HISTORY[location.name];

  if (!description && !milestones) {
    return <p className="text-p-ui text-muted-foreground">No history details available for this place yet.</p>;
  }

  // `LOCATION_HISTORY` is authored oldest-to-newest (the natural way to write a history),
  // but the timeline displays latest-first: the first entry is always the present/most
  // recent milestone, the last is always the earliest one, and both get a real icon marker
  // (active, so it renders filled) while everything in between is a plain inactive dot -
  // the in-between steps aren't meant to compete for attention with the two bookends.
  const displayMilestones = milestones ? [...milestones].reverse() : undefined;

  return (
    <div className={`flex flex-col ${mobile ? 'gap-4' : 'gap-8'}`}>
      {description && (
        <Section title="Overview">
          <p className="text-p-ui text-foreground">{description}</p>
        </Section>
      )}
      {displayMilestones && (
        <Section title="Timeline">
          <Timeline>
            {displayMilestones.map((milestone, index) => {
              const isLatest = index === 0;
              const isEarliest = index === displayMilestones.length - 1;
              return (
                <Timeline.Item
                  key={milestone.title}
                  title={milestone.title}
                  description={milestone.description}
                  icon={isLatest ? <Sparkle /> : isEarliest ? <Flag /> : undefined}
                  active={isLatest || isEarliest}
                />
              );
            })}
          </Timeline>
        </Section>
      )}
    </div>
  );
}

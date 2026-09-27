import { Copy, Footprints, Path } from '@phosphor-icons/react';
import { AccordionCard, Badge, Button, IconButton } from 'design-system';
import type { Location } from '@/types';
import { Section } from './Section';

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-detail text-muted-foreground">{label}</p>
      <div className="flex items-center justify-between gap-2">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="truncate text-p-ui text-link hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="truncate text-p-ui text-foreground">{value}</p>
        )}
        <IconButton
          icon={<Copy />}
          aria-label={`Copy ${label.toLowerCase()}`}
          size="sm"
          radius="rounded"
          onClick={() => navigator.clipboard.writeText(value)}
        />
      </div>
    </div>
  );
}

export function GettingThereTab({ location }: { location: Location }) {
  const details = location.details;
  const overview = details?.overview;
  const stations = details?.stationGuide.stations ?? [];
  const contact = details?.contact;

  return (
    <div className="flex flex-col gap-8">
      {overview?.admission && (
        <Section title="Admission">
          <p className="text-p-ui text-foreground">{overview.admission}</p>
          {overview.specialNotes?.admission && (
            <p className="text-subtle text-muted-foreground">{overview.specialNotes.admission}</p>
          )}
        </Section>
      )}

      {overview?.openingHours && (
        <Section title="Opening hours">
          <div className="flex flex-col overflow-hidden rounded-md border border-border">
            {Object.entries(overview.openingHours).map(([day, hours], index) => (
              <div
                key={day}
                className={`flex items-center ${index > 0 ? 'border-t border-border' : ''}`}
              >
                <p className="w-1/2 px-4 py-2.5 text-p-ui text-foreground">{DAY_LABELS[day] ?? day}</p>
                <p className="w-1/2 px-4 py-2.5 text-p-ui text-foreground">{hours}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {stations.length > 0 && (
        <Section title="Getting there">
          <p className="text-p-ui text-foreground">
            There {stations.length === 1 ? 'is' : 'are'} {stations.length} train station
            {stations.length === 1 ? '' : 's'} within walking distance to {location.name}.
          </p>
          <div className="flex flex-col gap-3">
            {stations.map((station) => (
              <AccordionCard
                key={station.stationCode}
                title={station.stationName}
                badge={<Badge color="secondary">{station.line}</Badge>}
                chips={[
                  { icon: <Footprints />, label: `${station.walkTime} min walk` },
                  { icon: <Path />, label: station.walkDistance },
                ]}
              >
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates[1]},${location.coordinates[0]}`,
                      '_blank'
                    )
                  }
                >
                  Get directions
                </Button>
              </AccordionCard>
            ))}
          </div>
        </Section>
      )}

      {contact && (
        <Section title="Contact details">
          <div className="flex flex-col gap-4">
            <ContactRow label="Address" value={contact.address} />
            {contact.website && <ContactRow label="Official website" value={contact.website} href={contact.website} />}
            {contact.phone && <ContactRow label="Phone number" value={contact.phone} />}
          </div>
        </Section>
      )}
    </div>
  );
}

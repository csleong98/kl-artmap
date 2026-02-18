'use client';

import { X, DoorOpen, Route, Ticket, Info } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Location } from '@/types';

interface LocationDetailProps {
  location: Location;
  onBack: () => void;
}

const LINE_TYPES = ['LRT', 'MRT', 'KTM', 'Monorail', 'ETS', 'KLIA'];

function parseLineInfo(line: string): { type: string; name: string } {
  for (const t of LINE_TYPES) {
    if (line.toUpperCase().startsWith(t.toUpperCase())) {
      const rest = line.slice(t.length).trim();
      return { type: t.toUpperCase(), name: rest || t.toUpperCase() };
    }
  }
  return { type: line, name: line };
}

const daysOfWeek = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
] as const;

export default function LocationDetail({ location, onBack }: LocationDetailProps) {
  const details = location.details;

  return (
    <div className="flex flex-col pt-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-ds-text-primary leading-tight">
          {location.name}
        </h2>
        <button
          onClick={onBack}
          className="shrink-0 border border-ds-border-light rounded-input p-1.5 hover:bg-ds-surface transition-colors"
        >
          <X className="w-4 h-4 text-ds-text-primary" />
        </button>
      </div>

      {/* Info chips */}
      <div className="flex flex-wrap gap-2 mt-4">
        <span
          className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs ${
            location.status === 'open'
              ? 'bg-[#f2f2f2] text-ds-text-primary'
              : 'bg-[#f2f2f2] text-ds-text-muted'
          }`}
        >
          <DoorOpen className="w-3.5 h-3.5" />
          {location.status === 'open' ? 'Open' : 'Closed'}
        </span>
        <span className="flex items-center gap-1.5 bg-[#f2f2f2] rounded-full px-2 py-1 text-xs text-ds-text-primary">
          <Route className="w-3.5 h-3.5" />
          {location.distance}
        </span>
        <span className="flex items-center gap-1.5 bg-[#f2f2f2] rounded-full px-2 py-1 text-xs text-ds-text-primary">
          <Ticket className="w-3.5 h-3.5" />
          {location.admission === 'free' ? 'Free' : 'Paid'}
        </span>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="about" className="mt-6">
        <TabsList className="w-full bg-[#f2f2f2] rounded-[10px] p-[3px]">
          <TabsTrigger
            value="about"
            className="flex-1 rounded-[8px] text-xs data-[state=active]:bg-[#d4d4d4] data-[state=active]:border data-[state=active]:border-[#a5adc0] data-[state=active]:shadow-none"
          >
            About
          </TabsTrigger>
          <TabsTrigger
            value="station-guide"
            className="flex-1 rounded-[8px] text-xs data-[state=active]:bg-[#d4d4d4] data-[state=active]:border data-[state=active]:border-[#a5adc0] data-[state=active]:shadow-none"
          >
            Station guide
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="flex-1 rounded-[8px] text-xs data-[state=active]:bg-[#d4d4d4] data-[state=active]:border data-[state=active]:border-[#a5adc0] data-[state=active]:shadow-none"
          >
            Contact
          </TabsTrigger>
        </TabsList>

        {/* About tab */}
        <TabsContent value="about" className="mt-4 flex flex-col gap-5">
          {details?.overview ? (
            <>
              <p className="text-sm leading-relaxed text-ds-text-secondary">
                {details.overview.description}
              </p>

              {/* Admission */}
              <div>
                <h3 className="text-sm font-semibold text-ds-text-primary mb-1">
                  Admission
                </h3>
                <p className="text-sm text-ds-text-secondary">
                  {details.overview.admission}
                </p>
              </div>

              {/* Opening hours */}
              <div>
                <h3 className="text-sm font-semibold text-ds-text-primary mb-2">
                  Opening hours
                </h3>

                {details.overview.specialNote && (
                  <div className="flex items-start gap-2 bg-[#f2f2f2] border border-ds-border-light rounded-lg p-3 mb-3">
                    <Info className="w-4 h-4 text-ds-text-muted shrink-0 mt-0.5" />
                    <p className="text-xs text-ds-text-secondary leading-relaxed">
                      {details.overview.specialNote}
                    </p>
                  </div>
                )}

                <div className="rounded-lg overflow-hidden border border-ds-border-light">
                  {daysOfWeek.map((day, i) => (
                    <div
                      key={day.key}
                      className={`flex justify-between px-3 py-2 text-sm ${
                        i % 2 === 0 ? 'bg-[#f2f2f2]' : 'bg-white'
                      }`}
                    >
                      <span className="text-ds-text-primary font-medium">
                        {day.label}
                      </span>
                      <span className="text-ds-text-secondary">
                        {details.overview.openingHours[day.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-ds-text-muted py-4">
              <p>{location.openingHours}</p>
              <p className="mt-2">
                Admission: {location.admission === 'free' ? 'Free' : 'Paid'}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Station guide tab */}
        <TabsContent value="station-guide" className="mt-4">
          <p className="text-base leading-[1.4] text-[#3f475a]">
            Train stations that are within walkable distance with this place
          </p>

          {details?.stationGuide ? (
            <div className="flex flex-col">
              {details.stationGuide.stations.map((station, i) => {
                const lineInfo = parseLineInfo(station.line);
                return (
                  <div
                    key={i}
                    className="flex flex-col gap-3 py-6 border-b border-ds-border"
                  >
                    <div className="flex flex-col gap-2.5">
                      <p className="text-2xl font-medium leading-[1.15] text-ds-text-primary">
                        {station.name}
                      </p>
                      <div className="flex gap-1.5 items-center">
                        <span className="bg-[#f2f2f2] rounded-full pl-1.5 pr-2 py-1 text-xs font-medium text-ds-text-primary">
                          {lineInfo.type}
                        </span>
                        <span className="bg-[#f2f2f2] rounded-full pl-1.5 pr-2 py-1 text-xs font-medium text-ds-text-primary">
                          {lineInfo.name}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm leading-none text-ds-text-secondary">
                      <span>Distance: </span>
                      <span>{station.walkDistance} walk from this station to place</span>
                    </p>
                  </div>
                );
              })}
            </div>
          ) : location.nearestStations?.length ? (
            <div className="flex flex-col">
              {location.nearestStations.map((station, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 py-6 border-b border-ds-border"
                >
                  <p className="text-2xl font-medium leading-[1.15] text-ds-text-primary">
                    {station}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ds-text-muted py-4">
              No station info available
            </p>
          )}
        </TabsContent>

        {/* Contact tab */}
        <TabsContent value="contact" className="mt-4">
          {details?.contact ? (
            <div className="flex flex-col gap-3">
              <div>
                <h3 className="text-xs font-semibold text-ds-text-muted uppercase tracking-wide mb-1">
                  Address
                </h3>
                <p className="text-sm text-ds-text-secondary">
                  {details.contact.address}
                </p>
              </div>
              {details.contact.website && (
                <div>
                  <h3 className="text-xs font-semibold text-ds-text-muted uppercase tracking-wide mb-1">
                    Website
                  </h3>
                  <a
                    href={details.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {details.contact.website}
                  </a>
                </div>
              )}
              {details.contact.phone && (
                <div>
                  <h3 className="text-xs font-semibold text-ds-text-muted uppercase tracking-wide mb-1">
                    Phone
                  </h3>
                  <a
                    href={`tel:${details.contact.phone}`}
                    className="text-sm text-ds-text-secondary hover:underline"
                  >
                    {details.contact.phone}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-xs font-semibold text-ds-text-muted uppercase tracking-wide mb-1">
                Address
              </h3>
              <p className="text-sm text-ds-text-secondary">
                {location.address}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

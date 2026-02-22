'use client';

import { useState } from 'react';
import { X, DoorOpen, Route, Ticket, Info, ArrowLeft, TriangleAlert, ExternalLink } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Location } from '@/types';
import { WalkingRouteData } from '@/hooks/useWalkingRoutes';
import { RouteStep } from '@/services/routeService';
import { formatDistance, formatDuration } from '@/services/routeService';

interface LocationDetailProps {
  location: Location;
  onBack: () => void;
  routeData?: WalkingRouteData[];
  routesLoading?: boolean;
  getStationRouteInfo?: (stationName: string) => WalkingRouteData | undefined;
  onRouteSelect?: (routeId: string) => void;
  onRouteDeselect?: () => void;
  onTabChange?: (tab: string) => void;
  initialTab?: string;
  activeRouteId?: string | null;
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

function RouteDetailView({
  route,
  locationName,
  locationCoordinates,
  onClose,
}: {
  route: WalkingRouteData;
  locationName: string;
  locationCoordinates: [number, number];
  onClose: () => void;
}) {
  const meaningfulSteps = route.steps.filter(s => s.distance > 5);
  const crossingCount = meaningfulSteps.filter(s => s.isCrossing).length;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: '#285ABD' }}
          />
          <h3 className="text-lg font-semibold text-ds-text-primary leading-tight">
            {route.stationName}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 border border-ds-border-light rounded-input p-1.5 hover:bg-ds-surface transition-colors"
        >
          <X className="w-4 h-4 text-ds-text-primary" />
        </button>
      </div>

      {/* Line badges */}
      <div className="flex gap-1.5 items-center flex-wrap mt-3">
        {route.lines.map((line, j) => {
          const lineInfo = parseLineInfo(line);
          return (
            <span
              key={j}
              className="bg-[#f2f2f2] rounded-full pl-1.5 pr-2 py-1 text-xs font-medium text-ds-text-primary"
            >
              {lineInfo.type} {lineInfo.name !== lineInfo.type ? lineInfo.name : ''}
            </span>
          );
        })}
      </div>

      {/* Summary */}
      <p className="text-sm text-ds-text-secondary mt-4">
        {route.formattedDistance} · {route.formattedDuration} walk
        {crossingCount > 0 && ` · ${crossingCount} road crossing${crossingCount > 1 ? 's' : ''}`}
      </p>

      {/* Indoor route note */}
      <div className="flex items-start gap-2 bg-[#f2f2f2] border border-ds-border-light rounded-lg p-3 mt-4">
        <Info className="w-4 h-4 text-ds-text-muted shrink-0 mt-0.5" />
        <p className="text-xs text-ds-text-secondary leading-relaxed">
          Directions show street-level routes only. Some stations may have underground walkways or covered links — check station signage on arrival.
        </p>
      </div>

      {/* Vertical timeline */}
      <div className="mt-6 flex flex-col">
        {/* Start node */}
        <div className="flex gap-3 items-start">
          <div className="flex flex-col items-center">
            <span
              className="w-3 h-3 rounded-full shrink-0 border-2"
              style={{ backgroundColor: '#285ABD', borderColor: '#285ABD' }}
            />
            {meaningfulSteps.length > 0 && (
              <div
                className="w-0.5 flex-1 min-h-[24px]"
                style={{ backgroundColor: '#285ABD', opacity: 0.3 }}
              />
            )}
          </div>
          <p className="text-sm font-medium text-ds-text-primary pb-4">
            {route.stationName}
          </p>
        </div>

        {/* Step nodes */}
        {meaningfulSteps.map((step, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex flex-col items-center">
              <span
                className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${
                  step.isCrossing ? 'bg-amber-400' : 'bg-[#d4d4d4]'
                }`}
              />
              {i < meaningfulSteps.length - 1 && (
                <div
                  className="w-0.5 flex-1 min-h-[24px]"
                  style={{ backgroundColor: '#285ABD', opacity: 0.3 }}
                />
              )}
              {i === meaningfulSteps.length - 1 && (
                <div
                  className="w-0.5 flex-1 min-h-[24px]"
                  style={{ backgroundColor: '#285ABD', opacity: 0.3 }}
                />
              )}
            </div>
            <div className={`pb-4 flex-1 ${step.isCrossing ? 'bg-amber-50 -mx-1 px-2 py-1.5 rounded-md border border-amber-200' : ''}`}>
              <p className={`text-sm leading-relaxed ${step.isCrossing ? 'text-amber-800' : 'text-ds-text-secondary'}`}>
                {step.isCrossing && <TriangleAlert className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5 text-amber-500" />}
                {step.instruction}
              </p>
              <span className="text-xs text-ds-text-muted mt-0.5 block">
                {formatDistance(step.distance)}
              </span>
            </div>
          </div>
        ))}

        {/* End node */}
        <div className="flex gap-3 items-start">
          <div className="flex flex-col items-center">
            <span className="w-3 h-3 rounded-full shrink-0 bg-[#1a1a2e] border-2 border-[#1a1a2e]" />
          </div>
          <p className="text-sm font-medium text-ds-text-primary">
            {locationName}
          </p>
        </div>
      </div>

      {/* Google Maps link */}
      <a
        href={`https://www.google.com/maps/dir/?api=1&origin=${route.coordinates[1]},${route.coordinates[0]}&destination=${locationCoordinates[1]},${locationCoordinates[0]}&travelmode=walking`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex items-center justify-center gap-2 w-full rounded-lg border border-ds-border-light py-2.5 text-sm font-medium text-ds-text-primary hover:bg-ds-surface transition-colors"
      >
        Open in Google Maps
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

export default function LocationDetail({ location, onBack, routeData, routesLoading, getStationRouteInfo, onRouteSelect, onRouteDeselect, onTabChange, initialTab, activeRouteId }: LocationDetailProps) {
  const [selectedRoute, setSelectedRoute] = useState<WalkingRouteData | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab || 'about');
  const details = location.details;

  const handleTabValueChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
    // When leaving station-guide, close any open route detail
    if (tab !== 'station-guide') {
      setSelectedRoute(null);
    }
  };

  const handleStationClick = (route: WalkingRouteData) => {
    setSelectedRoute(route);
    onRouteSelect?.(route.routeId);
  };

  const handleRouteClose = () => {
    setSelectedRoute(null);
    onRouteDeselect?.();
  };

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
      <Tabs value={activeTab} onValueChange={handleTabValueChange} className="mt-6">
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
          {selectedRoute ? (
            <RouteDetailView
              route={selectedRoute}
              locationName={location.name}
              locationCoordinates={location.coordinates}
              onClose={handleRouteClose}
            />
          ) : (
            <>
              <p className="text-base leading-[1.4] text-[#3f475a]">
                Train stations that are within walkable distance with this place
              </p>

              {routesLoading ? (
                <div className="flex flex-col">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex flex-col gap-3 py-6 border-b border-ds-border">
                      <div className="h-7 w-40 bg-[#f2f2f2] rounded animate-pulse" />
                      <div className="h-4 w-52 bg-[#f2f2f2] rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : routeData && routeData.length > 0 ? (
                <div className="flex flex-col">
                  {routeData.map((route, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-3 py-6 border-b border-ds-border cursor-pointer hover:bg-[#fafafa] transition-colors -mx-2 px-2 rounded-lg"
                      onClick={() => handleStationClick(route)}
                    >
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: activeRouteId === route.routeId ? '#285ABD' : '#C9C9C9' }}
                          />
                          <p className="text-2xl font-medium leading-[1.15] text-ds-text-primary">
                            {route.stationName}
                          </p>
                        </div>
                        <div className="flex gap-1.5 items-center flex-wrap">
                          {route.lines.map((line, j) => {
                            const lineInfo = parseLineInfo(line);
                            return (
                              <span
                                key={j}
                                className="bg-[#f2f2f2] rounded-full pl-1.5 pr-2 py-1 text-xs font-medium text-ds-text-primary"
                              >
                                {lineInfo.type} {lineInfo.name !== lineInfo.type ? lineInfo.name : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      {route.formattedDistance && (
                        <p className="text-sm leading-none text-ds-text-secondary">
                          <span>Distance: </span>
                          <span>{route.formattedDistance} · {route.formattedDuration} walk</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ds-text-muted py-4">
                  No station info available
                </p>
              )}
            </>
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

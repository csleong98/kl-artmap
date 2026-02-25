'use client';

import { useState, useMemo } from 'react';
import { X, DoorOpen, Route, Ticket, Info, ArrowLeft, TriangleAlert, ExternalLink, ArrowUpLeft, ArrowUpRight, MoveRight, MapPin, Footprints, Umbrella, ChevronDown, ChevronUp, Train } from 'lucide-react';
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

// Helper: Group route steps into logical segments
interface ProcessedSegment {
  type: 'turn' | 'walk' | 'arrive';
  instruction: string;
  streetName?: string;
  distance: number;
  duration: number;
  maneuverType?: string;
  maneuverModifier?: string;
  substeps?: RouteStep[];
  isCovered?: boolean; // TODO: Add real coverage detection
}

function processRouteSteps(steps: RouteStep[]): ProcessedSegment[] {
  const segments: ProcessedSegment[] = [];
  const MIN_STEP_DISTANCE = 20; // Ignore micro-steps < 20m

  let i = 0;
  while (i < steps.length) {
    const step = steps[i];

    // Skip micro-steps
    if (step.distance < MIN_STEP_DISTANCE) {
      i++;
      continue;
    }

    // Detect turn maneuvers
    if (step.maneuverType === 'turn' || step.maneuverType === 'new name') {
      // This is a turn - check if followed by walking on same street
      const walkingSteps: RouteStep[] = [];
      let totalDistance = step.distance;
      let totalDuration = step.duration;
      let j = i + 1;

      // Collect consecutive steps on the same street
      while (j < steps.length) {
        const nextStep = steps[j];
        // If it's a continue/straight on same street, group it
        if (
          nextStep.name === step.name &&
          (nextStep.maneuverType === 'continue' || nextStep.maneuverType === 'straight' || nextStep.distance < MIN_STEP_DISTANCE)
        ) {
          if (nextStep.distance >= MIN_STEP_DISTANCE) {
            walkingSteps.push(nextStep);
          }
          totalDistance += nextStep.distance;
          totalDuration += nextStep.duration;
          j++;
        } else {
          break;
        }
      }

      segments.push({
        type: 'turn',
        instruction: `Turn ${step.maneuverModifier || 'left'} on ${step.name || 'the street'}`,
        streetName: step.name,
        distance: totalDistance,
        duration: totalDuration,
        maneuverType: step.maneuverType,
        maneuverModifier: step.maneuverModifier,
        substeps: walkingSteps.length > 0 ? walkingSteps : undefined,
        isCovered: Math.random() > 0.5, // TODO: Replace with real coverage detection
      });

      i = j;
    } else if (step.maneuverType === 'arrive') {
      segments.push({
        type: 'arrive',
        instruction: 'You have arrived at the place!',
        distance: 0,
        duration: 0,
      });
      i++;
    } else {
      // Generic walking segment
      segments.push({
        type: 'walk',
        instruction: step.instruction || `Continue on ${step.name || 'the walkway'}`,
        streetName: step.name,
        distance: step.distance,
        duration: step.duration,
        maneuverType: step.maneuverType,
        isCovered: Math.random() > 0.5, // TODO: Replace with real coverage detection
      });
      i++;
    }
  }

  return segments;
}

// Helper: Get icon for maneuver type
function getManeuverIcon(segment: ProcessedSegment) {
  if (segment.type === 'arrive') {
    return <MapPin className="w-5 h-5 text-green-600" />;
  }

  if (segment.type === 'turn') {
    const modifier = segment.maneuverModifier?.toLowerCase() || 'left';
    if (modifier.includes('left')) {
      return <ArrowUpLeft className="w-5 h-5 text-ds-text-primary" />;
    } else if (modifier.includes('right')) {
      return <ArrowUpRight className="w-5 h-5 text-ds-text-primary" />;
    }
  }

  return <Footprints className="w-5 h-5 text-ds-text-secondary" />;
}

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
  const [expandedSegments, setExpandedSegments] = useState<Set<number>>(new Set());

  // Memoize expensive route processing to prevent recalculation on every render
  const segments = useMemo(() => processRouteSteps(route.steps), [route.steps]);

  const toggleSegment = (index: number) => {
    setExpandedSegments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col">
      {/* Station Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-ds-text-primary leading-tight mb-1">
            {route.stationName}
          </h3>
          <p className="text-sm font-medium text-blue-600 mb-2">{route.exitName}</p>
          {route.exitDescription && (
            <p className="text-xs text-gray-500 mb-2">{route.exitDescription}</p>
          )}
          {route.hasIndoorRoute && (
            <div className="flex gap-2 items-center mb-2">
              <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded flex items-center gap-1">
                🏢 {route.indoorPercentage}% Indoor Route
              </span>
              {route.indoorFeatures && route.indoorFeatures.includes('air-conditioned') && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                  ❄️ Air-conditioned
                </span>
              )}
            </div>
          )}
          <div className="flex gap-2 items-center flex-wrap">
            {route.lines.map((line, j) => {
              const lineInfo = parseLineInfo(line);
              return (
                <div key={j} className="flex items-center gap-1.5 bg-[#f2f2f2] rounded px-2 py-1">
                  <Train className="w-3.5 h-3.5 text-ds-text-primary" />
                  <span className="text-xs font-medium text-ds-text-primary">
                    {lineInfo.type}
                  </span>
                  {lineInfo.name !== lineInfo.type && (
                    <>
                      <span className="text-xs text-ds-text-muted">•</span>
                      <span className="text-xs text-ds-text-secondary">
                        {lineInfo.name}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 border border-ds-border-light rounded-lg p-2 hover:bg-ds-surface transition-colors"
        >
          <X className="w-5 h-5 text-ds-text-primary" />
        </button>
      </div>

      {/* Route Timeline with Overlapping Cards */}
      <div className="relative mt-6">
        {/* Continuous vertical line - behind everything */}
        <div
          className="absolute left-[20px] top-0 bottom-0 w-[2px] bg-gray-300"
          style={{ zIndex: 1 }}
        />

        {/* Segments */}
        <div className="relative space-y-3" style={{ zIndex: 2 }}>
          {segments.map((segment, index) => {
            const isExpanded = expandedSegments.has(index);
            const hasSubsteps = segment.substeps && segment.substeps.length > 0;
            const timeEstimate = Math.ceil(segment.duration / 60); // minutes

            if (segment.type === 'arrive') {
              // Arrival point
              return (
                <div key={index} className="flex items-start gap-3 relative">
                  <div className="relative flex items-center justify-center w-10 h-10 shrink-0" style={{ zIndex: 3 }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-green-600" fill="currentColor" />
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-base font-medium text-ds-text-primary">
                      {segment.instruction}
                    </p>
                  </div>
                </div>
              );
            }

            if (segment.type === 'turn') {
              // Turn card - overlaps timeline
              return (
                <div key={index} className="relative">
                  {/* Direction card */}
                  <div className="flex items-start gap-3">
                    <div className="relative flex items-center justify-center w-10 h-10 shrink-0" style={{ zIndex: 3 }}>
                      <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full border-2 border-gray-300">
                        {getManeuverIcon(segment)}
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-lg p-3 relative" style={{ zIndex: 3 }}>
                      <p className="text-base font-medium text-ds-text-primary">
                        {segment.instruction}
                      </p>
                    </div>
                  </div>

                  {/* Walking segment (indented, connected to timeline) */}
                  <div className="ml-10 mt-3">
                    <button
                      onClick={() => toggleSegment(index)}
                      className="w-full flex items-center gap-2 text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
                    >
                      <Footprints className="w-4 h-4 text-ds-text-secondary shrink-0" />
                      {segment.isCovered && (
                        <>
                          <Umbrella className="w-4 h-4 text-blue-500 shrink-0" />
                          <Umbrella className="w-4 h-4 text-blue-500 shrink-0" />
                        </>
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-ds-text-primary">
                          Walk {timeEstimate} mins on {segment.streetName || 'the street'}
                        </p>
                        <p className="text-xs text-ds-text-muted">
                          {formatDistance(segment.distance)}
                        </p>
                      </div>
                      {hasSubsteps && (
                        isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-ds-text-muted shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-ds-text-muted shrink-0" />
                        )
                      )}
                    </button>

                    {/* Expandable substeps */}
                    {hasSubsteps && isExpanded && (
                      <div className="ml-6 mt-2 space-y-2 pb-2 border-l-2 border-gray-200 pl-3">
                        {segment.substeps!.map((substep, subIndex) => (
                          <div key={subIndex} className="text-xs text-ds-text-secondary">
                            <p>{substep.instruction}</p>
                            <p className="text-ds-text-muted mt-0.5">
                              {formatDistance(substep.distance)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // Generic walk segment
            return (
              <div key={index} className="ml-10">
                <div className="flex items-center gap-2 text-left p-2">
                  <Footprints className="w-4 h-4 text-ds-text-secondary shrink-0" />
                  {segment.isCovered && (
                    <>
                      <Umbrella className="w-4 h-4 text-blue-500 shrink-0" />
                      <Umbrella className="w-4 h-4 text-blue-500 shrink-0" />
                    </>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-ds-text-primary">
                      {segment.instruction}
                    </p>
                    <p className="text-xs text-ds-text-muted">
                      {formatDistance(segment.distance)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
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
                          <div>
                            <p className="text-2xl font-medium leading-[1.15] text-ds-text-primary">
                              {route.stationName}
                            </p>
                            <div className="flex gap-2 items-center flex-wrap">
                              <p className="text-sm font-medium text-blue-600">{route.exitName}</p>
                              {route.hasIndoorRoute && (
                                <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded">
                                  🏢 Indoor
                                </span>
                              )}
                            </div>
                          </div>
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

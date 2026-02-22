'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, ListFilter } from 'lucide-react';
import { animate } from 'motion';
import { mockLocations } from '@/data/mockLocations';
import { Location } from '@/types';
import { WalkingRouteData } from '@/hooks/useWalkingRoutes';
import LocationDetail from './location-detail';

interface SidePanelProps {
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
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

export default function SidePanel({ selectedLocation, onLocationSelect, onBack, routeData, routesLoading, getStationRouteInfo, onRouteSelect, onRouteDeselect, onTabChange, initialTab, activeRouteId }: SidePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return mockLocations;

    return mockLocations.filter(
      (location) =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleLocationHover = useCallback((locationId: string, isEntering: boolean) => {
    const markerEl = document.querySelector(`[data-marker-id="${locationId}"]`);
    const svg = markerEl?.querySelector('svg');
    if (!svg) return;
    animate(svg, { scale: isEntering ? 1.3 : 1 }, { duration: 0.2 });
  }, []);

  // Detail view
  if (selectedLocation) {
    return (
      <LocationDetail
        location={selectedLocation}
        onBack={onBack}
        routeData={routeData}
        routesLoading={routesLoading}
        getStationRouteInfo={getStationRouteInfo}
        onRouteSelect={onRouteSelect}
        onRouteDeselect={onRouteDeselect}
        onTabChange={onTabChange}
        initialTab={initialTab}
        activeRouteId={activeRouteId}
      />
    );
  }

  // List view
  return (
    <div className="flex flex-col pt-10">
      {/* Title + subtitle */}
      <div className="flex flex-col gap-4">
        <h1 className="text-[40px] font-semibold leading-[1.15] text-ds-text-primary">
          KL Art Map
        </h1>
        <p className="text-base leading-[1.4] text-ds-text-secondary">
          Explore artsy spots in the city of Kuala Lumpur that are also near the train stations.
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 items-center mt-6">
        <div className="flex flex-1 items-center gap-2 bg-ds-surface border border-ds-border-light rounded-input px-4 py-2.5">
          <Search className="w-5 h-5 text-ds-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search places"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-base text-ds-text-primary placeholder:text-ds-text-muted focus:outline-none"
          />
        </div>
        <button className="border border-ds-border-light rounded-input p-2.5 bg-white hover:bg-ds-surface transition-colors">
          <ListFilter className="w-5 h-5 text-ds-text-primary" />
        </button>
      </div>

      {/* Location list */}
      <ul className="flex flex-col">
        {filteredLocations.length === 0 ? (
          <li className="py-6 text-sm text-ds-text-muted">No locations found</li>
        ) : (
          filteredLocations.map((location) => (
            <li
              key={location.name}
              className="flex flex-col gap-3 py-6 border-b border-ds-border cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onLocationSelect(location)}
              onMouseEnter={() => handleLocationHover(location.name, true)}
              onMouseLeave={() => handleLocationHover(location.name, false)}
            >
              <h2 className="text-2xl font-medium leading-[1.15] text-ds-text-primary">
                {location.name}
              </h2>
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5 items-center text-sm leading-none text-ds-text-secondary">
                  <span className="truncate">{location.address}</span>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

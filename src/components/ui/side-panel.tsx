'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, ListFilter, LayoutGrid, List, CircleDot, Ticket, Train } from 'lucide-react';
import { animate } from 'motion';
import { mockLocations } from '@/data/mockLocations';
import { Location } from '@/types';
import { WalkingRouteData } from '@/hooks/useWalkingRoutes';
import LocationDetail from './location-detail';
import StackedList from './stacked-list';
import GridList from './grid-list';
import PanelHeader from './panel-header';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

interface SidePanelProps {
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  onBack: () => void;
  routeData?: WalkingRouteData[];
  routesLoading?: boolean;
  getStationRouteInfo?: (stationName: string) => WalkingRouteData | undefined;
  onTabChange?: (tab: string) => void;
  initialTab?: string;
  showBackground?: boolean;
}

export default function SidePanel({ selectedLocation, onLocationSelect, onBack, routeData, routesLoading, getStationRouteInfo, onTabChange, initialTab, showBackground = false }: SidePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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

  // Root container with conditional background
  return (
    <div
      className="flex flex-col h-full"
      style={showBackground ? {
        backgroundImage: 'url(/assets/header-bg-mural-artwork.svg)',
        backgroundSize: 'contain',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat'
      } : undefined}
    >
      {selectedLocation ? (
        // Detail view
        <>
          {/* Detail content - with white background */}
          <div className="bg-white px-6">
            <LocationDetail
              location={selectedLocation}
              onBack={onBack}
              routeData={routeData}
              routesLoading={routesLoading}
              getStationRouteInfo={getStationRouteInfo}
              onTabChange={onTabChange}
              initialTab={initialTab}
            />
          </div>
        </>
      ) : (
        // List view
        <>
          {/* Header Section - Transparent to show background */}
          <div className="px-6 py-6">
            <PanelHeader
              title="KL Art Map"
              description="Explore artsy spots in the city of Kuala Lumpur that are also near the train stations."
            />
          </div>

          {/* Content Section - White background with padding */}
          <div className="flex-1 bg-white px-6 py-4">
            {/* Search + filter */}
            <div className="flex gap-2 items-center w-full">
              <InputGroup className="flex-1 h-10 rounded-xl [&>*:first-child]:rounded-l-xl [&>*:last-child]:rounded-r-xl">
                <InputGroupAddon className="h-10">
                  <Search className="w-5 h-5" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search places"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10"
                />
              </InputGroup>
              <Button variant="outline" size="icon" className="rounded-xl">
                <ListFilter className="w-5 h-5" />
              </Button>
            </div>

      {/* View toggle */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-ds-text-secondary">
          {filteredLocations.length} {filteredLocations.length === 1 ? 'location' : 'locations'}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode('list')}
            className="rounded-xl"
          >
            <List className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode('grid')}
            className="rounded-xl"
          >
            <LayoutGrid className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Location list */}
      {viewMode === 'list' ? (
        <div className="flex flex-col gap-3 mt-6">
          {filteredLocations.length === 0 ? (
            <div className="py-6 text-sm text-ds-text-muted">No locations found</div>
          ) : (
            filteredLocations.map((location) => {
              const stationCount = location.nearestStations?.length || 0;

              return (
                <StackedList
                  key={location.name}
                  title={location.name}
                  subtitle={location.address}
                  metadata={[
                    {
                      icon: <CircleDot className="w-3.5 h-3.5" />,
                      label: location.status === 'open' ? 'Open' : 'Closed'
                    },
                    {
                      icon: <Ticket className="w-3.5 h-3.5" />,
                      label: location.admission === 'free' ? 'Free' : 'Paid'
                    },
                    {
                      icon: <Train className="w-3.5 h-3.5" />,
                      label: `${stationCount} ${stationCount === 1 ? 'station' : 'stations'}`
                    }
                  ]}
                  thumbnail={location.imageUrl}
                  showThumbnail={true}
                  onClick={() => onLocationSelect(location)}
                  onMouseEnter={() => handleLocationHover(location.name, true)}
                  onMouseLeave={() => handleLocationHover(location.name, false)}
                />
              );
            })
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-6">
          {filteredLocations.length === 0 ? (
            <div className="col-span-2 py-6 text-sm text-ds-text-muted">No locations found</div>
          ) : (
            filteredLocations.map((location) => {
              const stationCount = location.nearestStations?.length || 0;

              return (
                <GridList
                  key={location.name}
                  title={location.name}
                  metadata={[
                    {
                      icon: <CircleDot className="w-3.5 h-3.5" />,
                      label: location.status === 'open' ? 'Open' : 'Closed'
                    },
                    {
                      icon: <Ticket className="w-3.5 h-3.5" />,
                      label: location.admission === 'free' ? 'Free' : 'Paid'
                    },
                    {
                      icon: <Train className="w-3.5 h-3.5" />,
                      label: `${stationCount} ${stationCount === 1 ? 'station' : 'stations'}`
                    }
                  ]}
                  thumbnail={location.imageUrl}
                  showThumbnail={true}
                  onClick={() => onLocationSelect(location)}
                  onMouseEnter={() => handleLocationHover(location.name, true)}
                  onMouseLeave={() => handleLocationHover(location.name, false)}
                />
              );
            })
          )}
        </div>
      )}
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, LayoutGrid, List, CircleDot, Ticket, Train, DoorOpen, Rows, Grid2x2 } from 'lucide-react';
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useCarousel } from '@/components/ui/carousel';
import Image from 'next/image';

// Carousel Dots Component - tracks active slide
function CarouselDots({ count }: { count: number }) {
  const { api } = useCarousel();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => api?.scrollTo(index)}
          className={`w-1.5 h-1.5 rounded-full transition-all ${
            index === current
              ? 'bg-white w-6'
              : 'bg-white/60 hover:bg-white/90'
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}

interface SidePanelProps {
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  onBack: () => void;
  routeData?: WalkingRouteData[];
  routesLoading?: boolean;
  getStationRouteInfo?: (stationName: string) => WalkingRouteData | undefined;
  onTabChange?: (tab: string) => void;
  initialTab?: string;
}

export default function SidePanel({ selectedLocation, onLocationSelect, onBack, routeData, routesLoading, getStationRouteInfo, onTabChange, initialTab }: SidePanelProps) {
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

  // Root container with beige background
  return (
    <div className="flex flex-col h-full bg-[#FBFAF8]">
      {selectedLocation ? (
        // Detail view
        <>
          {/* Header Section - Transparent to show background */}
          <div className="px-6 py-6">
            <PanelHeader
              variant="details"
              showSymbols={false}
              title={selectedLocation.name}
              description={selectedLocation.details?.overview?.description || ''}
              tags={
                <>
                  <span className="flex items-center gap-1.5 bg-[#f2f2f2] rounded-[24px] pl-1.5 pr-2 py-1 text-sm text-[#2e2a31]">
                    <DoorOpen className="w-3 h-3" />
                    {selectedLocation.status === 'open' ? 'Open now' : 'Closed'}
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#f2f2f2] rounded-[24px] pl-1.5 pr-2 py-1 text-sm text-[#2e2a31]">
                    <Ticket className="w-3 h-3" />
                    {selectedLocation.admission === 'free' ? 'Free' : 'Paid'}
                  </span>
                </>
              }
              onShare={() => {
                const url = `${window.location.origin}?location=${encodeURIComponent(selectedLocation.name)}&tab=${initialTab || 'about'}`;
                navigator.clipboard.writeText(url);
                console.log('URL copied to clipboard:', url);
              }}
              onBack={onBack}
            />
          </div>

          {/* Content Section */}
          <div className="flex-1 px-6 py-6">
            {/* Image Section - Conditional rendering based on image count */}
            {selectedLocation.images && selectedLocation.images.length > 0 && (
              <div className="mb-6">
                {selectedLocation.images.length === 1 ? (
                  // Single image - static display
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-200 relative">
                    <Image
                      src={selectedLocation.images[0]}
                      alt={selectedLocation.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  // Multiple images - carousel
                  <Carousel className="w-full">
                    <CarouselContent>
                      {selectedLocation.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-200 relative">
                            <Image
                              src={image}
                              alt={`${selectedLocation.name} - Image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                    <CarouselDots count={selectedLocation.images.length} />
                  </Carousel>
                )}
              </div>
            )}

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

          {/* Content Section with padding */}
          <div className="flex-1 px-6 py-6">
            {/* Search + view toggles */}
            <div className="flex gap-3 items-center w-full">
              <InputGroup className="flex-1 h-10 rounded-full [&>*:first-child]:rounded-l-full [&>*:last-child]:rounded-r-full">
                <InputGroupAddon>
                  <Search className="w-5 h-5" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search places"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-full"
                >
                  <Rows className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-full"
                >
                  <Grid2x2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

      {/* Location counter */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-ds-text-secondary">
          Showing {filteredLocations.length} {filteredLocations.length === 1 ? 'place' : 'places'}
        </span>
      </div>

      {/* Location list */}
      {viewMode === 'list' ? (
        <div className="flex flex-col gap-3 mt-4">
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
                  thumbnail={location.images?.[0]}
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
        <div className="grid grid-cols-2 gap-4 mt-4">
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
                  thumbnail={location.images?.[0]}
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

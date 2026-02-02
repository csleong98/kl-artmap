'use client';

import { useState, useMemo } from 'react';
import { Location, FilterType, TabType, PanelState } from '@/types';
import { mockLocations } from '@/data/mockLocations';
import PanelHeader from './panel-header';
import LocationCard from './location-card';
import FilterDialog, { FilterState } from './filter-dialog';
import ImageCarousel from './image-carousel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Badge } from './badge';

interface FloatingPanelProps {
  className?: string;
  onLocationSelect?: (location: Location) => Promise<void>;
  onLocationDeselect?: () => void;
  getRouteInfo?: (stationName: string) => {
    distance: string;
    duration: string;
    color: string;
    distanceMeters: number;
    durationMinutes: number;
  } | null;
  routeLoading?: boolean;
  routeError?: string | null;
}

export default function FloatingPanel({
  className = '',
  onLocationSelect,
  onLocationDeselect,
  getRouteInfo,
  routeLoading = false,
  routeError = null
}: FloatingPanelProps) {
  // State management
  const [panelState, setPanelState] = useState<PanelState>('collapsed');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('art_museums');
  const [detailTab, setDetailTab] = useState<TabType>('overview');
  const [activeFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    status: [],
    admission: [],
    trainLines: [],
    sortBy: 'name_asc'
  });

  // Filtered locations based on current filters and search
  const filteredLocations = useMemo(() => {
    let filtered = mockLocations;

    // Filter by tab type
    if (activeTab === 'art_museums') {
      filtered = filtered.filter(location => location.type === 'art_museum');
    } else if (activeTab === 'art_galleries') {
      filtered = filtered.filter(location => location.type === 'art_gallery');
    } else if (activeTab === 'art_spaces') {
      filtered = filtered.filter(location => location.type === 'monument');
    }

    // Filter by type (from filter pills)
    if (activeFilter !== 'all') {
      filtered = filtered.filter(location => location.type === activeFilter);
    }

    // Apply advanced filters from dialog
    if (filterState.status.length > 0) {
      filtered = filtered.filter(location => filterState.status.includes(location.status));
    }

    if (filterState.admission.length > 0) {
      filtered = filtered.filter(location =>
        location.admission && filterState.admission.includes(location.admission)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (filterState.sortBy) {
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'distance_nearest':
      case 'distance_furthest':
        // For now, just sort by distance string - in real app would use actual distances
        break;
    }

    return filtered;
  }, [activeTab, activeFilter, searchQuery, filterState]);

  // Handle location selection (expand panel)
  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location);
    setPanelState('expanded');
    setDetailTab('overview'); // Reset to overview tab

    // Trigger route display if handler is provided
    if (onLocationSelect) {
      try {
        await onLocationSelect(location);
      } catch (error) {
        console.error('Error displaying routes:', error);
      }
    }
  };

  // Handle back to list view
  const handleBackToList = () => {
    setSelectedLocation(null);
    setPanelState('collapsed');

    // Clear routes when going back to list
    if (onLocationDeselect) {
      onLocationDeselect();
    }
  };

  // Handle filter dialog
  const handleFilterClick = () => {
    setIsFilterDialogOpen(true);
  };

  const handleFilterApply = (filters: FilterState) => {
    setFilterState(filters);
  };

  // Mobile-first responsive classes with safe area support
  const baseClasses = "fixed inset-x-4 bottom-4 safe-bottom md:absolute md:top-4 md:left-4 md:bottom-auto md:right-auto w-auto md:w-96 bg-white rounded-lg shadow-lg z-10 max-h-[70vh] md:max-h-[calc(100vh-2rem)] overflow-hidden";

  // Mobile handle indicator component
  const MobileHandle = () => (
    <div className="md:hidden flex justify-center py-2">
      <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
    </div>
  );

  if (panelState === 'expanded' && selectedLocation) {
    return (
      <div className={`${baseClasses} ${className}`}>
        <MobileHandle />
        <PanelHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showBackButton={true}
          onBackClick={handleBackToList}
          title={selectedLocation.name}
          onFilterClick={handleFilterClick}
        />

        <div className="overflow-y-auto max-h-[calc(70vh-8rem)] md:max-h-[calc(100vh-8rem)]">
          <div className="p-4 space-y-4">
            {/* Image Carousel */}
            <ImageCarousel
              images={selectedLocation.images || [selectedLocation.imageUrl || '']}
              alt={selectedLocation.name}
            />


            {/* Status indicators */}
            <div className="flex items-center gap-3 text-sm">
              <Badge variant={selectedLocation.status === 'open' ? 'default' : 'destructive'}>
                {selectedLocation.status === 'open' ? 'OPEN' : 'CLOSED'}
              </Badge>
              <span>•</span>
              <span className="text-muted-foreground">
                {selectedLocation.status === 'open'
                  ? selectedLocation.openingHours
                  : selectedLocation.reopenTime
                }
              </span>
              {selectedLocation.admission === 'free' && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    FREE
                  </Badge>
                </>
              )}
            </div>

            {/* Detail Tabs */}
            {selectedLocation.details && (
              <Tabs value={detailTab} onValueChange={(value) => setDetailTab(value as TabType)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="station_guide">Station guide</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          {/* Tab Content */}
          {selectedLocation.details && (
            <Tabs value={detailTab} onValueChange={(value) => setDetailTab(value as TabType)}>
              <TabsContent value="overview" className="px-4 pb-4 mt-0">
                <div className="space-y-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedLocation.details.overview.description}
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">Admission</h4>
                      <p className="text-sm text-gray-600">{selectedLocation.details.overview.admission}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-2">Opening hours</h4>
                      <div className="space-y-1 text-sm">
                        {Object.entries(selectedLocation.details.overview.openingHours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{day}</span>
                            <span className={hours === 'Closed' ? 'text-red-600' : 'text-gray-900'}>
                              {hours}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {selectedLocation.details.overview.specialNote && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <p className="text-blue-800 text-sm">{selectedLocation.details.overview.specialNote}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="station_guide" className="px-4 pb-4 mt-0">
                <div className="space-y-3">
                  {/* Route loading state */}
                  {routeLoading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-blue-800 text-sm">Loading walking routes...</span>
                      </div>
                    </div>
                  )}

                  {/* Route error state */}
                  {routeError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-red-800 text-sm">{routeError}</p>
                      </div>
                    </div>
                  )}

                  {selectedLocation.details.stationGuide.stations.map((station, index) => {
                    const routeInfo = getRouteInfo ? getRouteInfo(station.name) : null;

                    return (
                      <div key={index} className="bg-blue-100 rounded-lg p-3 relative">
                        {/* Route color indicator */}
                        {routeInfo && (
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                            style={{ backgroundColor: routeInfo.color }}
                          ></div>
                        )}

                        <div className="flex items-center justify-between ml-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{station.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
                                {station.line}
                              </span>
                              <span>•</span>
                              <span>{station.line.split(' ').pop()} Line</span>
                            </div>
                          </div>

                          <div className="text-right">
                            {/* Display route info if available, otherwise fallback to static data */}
                            {routeInfo ? (
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {routeInfo.durationMinutes} mins
                                </div>
                                <div className="text-xs text-gray-600">
                                  {routeInfo.distance} walk
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-semibold text-gray-900">{station.walkTime}</div>
                                <div className="text-xs text-gray-600">
                                  {station.walkDistance || 'mins walk'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Additional route details */}
                        {routeInfo && !routeLoading && (
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>Walking route calculated</span>
                              <span>•</span>
                              <span>Distance: {routeInfo.distance}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Route legend */}
                  {getRouteInfo && selectedLocation.nearestStations && !routeLoading && !routeError && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Route Colors</h5>
                      <div className="space-y-1">
                        {selectedLocation.nearestStations.map((stationName) => {
                          const routeInfo = getRouteInfo(stationName);
                          if (!routeInfo) return null;

                          return (
                            <div key={stationName} className="flex items-center gap-2 text-xs">
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: routeInfo.color }}
                              ></div>
                              <span className="text-gray-600">Route from {stationName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contact" className="px-4 pb-4 mt-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">Address</h4>
                    <p className="text-sm text-gray-600">{selectedLocation.details.contact.address}</p>
                  </div>
                  {selectedLocation.details.contact.website && (
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">Website</h4>
                      <a
                        href={selectedLocation.details.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {selectedLocation.details.contact.website}
                      </a>
                    </div>
                  )}
                  {selectedLocation.details.contact.phone && (
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">Phone</h4>
                      <a
                        href={`tel:${selectedLocation.details.contact.phone}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {selectedLocation.details.contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    );
  }

  // Collapsed state (list view)
  return (
    <div className={`${baseClasses} ${className}`}>
      <MobileHandle />
      <PanelHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultsCount={filteredLocations.length}
        onFilterClick={handleFilterClick}
      />


      {/* Location list */}
      <div className="overflow-y-auto max-h-[50vh] md:max-h-96">
        <div className="px-4 pb-4 space-y-1">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No locations found
            </div>
          ) : (
            filteredLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onClick={handleLocationSelect}
              />
            ))
          )}
        </div>
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        onApply={handleFilterApply}
        initialFilters={filterState}
      />
    </div>
  );
}
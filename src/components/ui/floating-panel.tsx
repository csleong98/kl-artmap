'use client';

import { useState, useMemo } from 'react';
import { Location, FilterType, TabType, PanelState } from '@/types';
import { mockLocations } from '@/data/mockLocations';
import PanelHeader from './panel-header';
import FilterPills from './filter-pills';
import LocationCard from './location-card';

interface FloatingPanelProps {
  className?: string;
}

export default function FloatingPanel({ className = '' }: FloatingPanelProps) {
  // State management
  const [panelState, setPanelState] = useState<PanelState>('collapsed');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('places');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered locations based on current filters and search
  const filteredLocations = useMemo(() => {
    let filtered = mockLocations;

    // Filter by type
    if (activeFilter !== 'all') {
      filtered = filtered.filter(location => location.type === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [activeFilter, searchQuery]);

  // Handle location selection (expand panel)
  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setPanelState('expanded');
  };

  // Handle back to list view
  const handleBackToList = () => {
    setSelectedLocation(null);
    setPanelState('collapsed');
  };

  const baseClasses = "absolute top-4 left-4 w-96 bg-white rounded-lg shadow-lg z-10 max-h-[calc(100vh-2rem)] overflow-hidden";

  if (panelState === 'expanded' && selectedLocation) {
    return (
      <div className={`${baseClasses} ${className}`}>
        <PanelHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showBackButton={true}
          onBackClick={handleBackToList}
          title={selectedLocation.name}
        />

        <div className="p-4 space-y-4 overflow-y-auto max-h-96">
          {/* Image placeholder */}
          <div className="w-full h-48 bg-slate-300 rounded-lg flex items-center justify-center">
            <span className="text-slate-500">Image placeholder</span>
          </div>

          {/* Filter pills */}
          <FilterPills
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {/* Location details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">{selectedLocation.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedLocation.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Distance</span>
                <p className="font-medium">{selectedLocation.distance}</p>
              </div>
              <div>
                <span className="text-gray-500">Walk time</span>
                <p className="font-medium">{selectedLocation.walkTime}</p>
              </div>
              <div>
                <span className="text-gray-500">Status</span>
                <p className={`font-medium ${
                  selectedLocation.status === 'open' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedLocation.status === 'open' ? 'Open' : 'Closed'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Hours</span>
                <p className="font-medium">
                  {selectedLocation.status === 'open'
                    ? selectedLocation.openingHours
                    : selectedLocation.reopenTime
                  }
                </p>
              </div>
            </div>

            {/* Action buttons placeholder */}
            <div className="flex gap-2 pt-4">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Get Directions
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Collapsed state (list view)
  return (
    <div className={`${baseClasses} ${className}`}>
      <PanelHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="px-4 pb-4">
        <FilterPills
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      {/* Location list */}
      <div className="overflow-y-auto max-h-96">
        {activeTab === 'places' ? (
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
        ) : (
          <div className="px-4 pb-4 text-center py-8 text-gray-500">
            Train stations coming soon
          </div>
        )}
      </div>
    </div>
  );
}
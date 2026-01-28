'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Button } from './button';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  status: ('open' | 'closed')[];
  admission: ('free' | 'paid')[];
  trainLines: ('lrt' | 'mrt' | 'mrl')[];
  sortBy: 'name_asc' | 'name_desc' | 'distance_nearest' | 'distance_furthest';
}

const defaultFilters: FilterState = {
  status: [],
  admission: [],
  trainLines: [],
  sortBy: 'name_asc'
};

export default function FilterDialog({
  isOpen,
  onClose,
  onApply,
  initialFilters = defaultFilters
}: FilterDialogProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleStatusChange = (status: 'open' | 'closed', checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      status: checked
        ? [...prev.status, status]
        : prev.status.filter(s => s !== status)
    }));
  };

  const handleAdmissionChange = (admission: 'free' | 'paid', checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      admission: checked
        ? [...prev.admission, admission]
        : prev.admission.filter(a => a !== admission)
    }));
  };

  const handleTrainLineChange = (line: 'lrt' | 'mrt' | 'mrl', checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      trainLines: checked
        ? [...prev.trainLines, line]
        : prev.trainLines.filter(l => l !== line)
    }));
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const handleClearAll = () => {
    setFilters(defaultFilters);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-96 max-w-[90vw] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Filter & Sort</DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            {/* Filters Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Filters</h3>

              {/* Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes('open')}
                      onChange={(e) => handleStatusChange('open', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Open</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes('closed')}
                      onChange={(e) => handleStatusChange('closed', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Closed</span>
                  </label>
                </div>
              </div>

              {/* Admission */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Admission</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.admission.includes('free')}
                      onChange={(e) => handleAdmissionChange('free', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Free</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.admission.includes('paid')}
                      onChange={(e) => handleAdmissionChange('paid', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Paid</span>
                  </label>
                </div>
              </div>

              {/* Train Lines */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Train lines</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.trainLines.includes('lrt')}
                      onChange={(e) => handleTrainLineChange('lrt', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">LRT</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.trainLines.includes('mrt')}
                      onChange={(e) => handleTrainLineChange('mrt', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">MRT</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.trainLines.includes('mrl')}
                      onChange={(e) => handleTrainLineChange('mrl', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">MRL</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sort Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Sort by</h3>

              {/* Name */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Name</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      checked={filters.sortBy === 'name_asc'}
                      onChange={() => handleSortChange('name_asc')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">A-Z</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      checked={filters.sortBy === 'name_desc'}
                      onChange={() => handleSortChange('name_desc')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Z-A</span>
                  </label>
                </div>
              </div>

              {/* Distance */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Distance to place</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      checked={filters.sortBy === 'distance_nearest'}
                      onChange={() => handleSortChange('distance_nearest')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Nearest</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      checked={filters.sortBy === 'distance_furthest'}
                      onChange={() => handleSortChange('distance_furthest')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Furthest</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleClearAll}
          >
            Clear all
          </Button>
          <Button onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
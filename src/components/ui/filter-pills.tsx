import { FilterType } from '@/types';

interface FilterPillsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters = [
  { value: 'all' as FilterType, label: 'All' },
  { value: 'art_gallery' as FilterType, label: 'Art Galleries' },
  { value: 'art_museum' as FilterType, label: 'Art Museums' },
  { value: 'monument' as FilterType, label: 'Art Spaces' },
];

export default function FilterPills({ activeFilter, onFilterChange }: FilterPillsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            activeFilter === filter.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
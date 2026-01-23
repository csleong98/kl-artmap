import { Location } from '@/types';

interface LocationCardProps {
  location: Location;
  onClick?: (location: Location) => void;
}

export default function LocationCard({ location, onClick }: LocationCardProps) {
  return (
    <div
      className="flex gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
      onClick={() => onClick?.(location)}
    >
      {/* Placeholder image */}
      <div className="w-16 h-16 bg-slate-400 rounded-lg flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">
          {location.name}
        </h3>
        <div className="text-sm text-gray-600 space-y-0.5">
          <div className="flex items-center gap-2">
            <span>Distance: {location.distance}</span>
            <span>•</span>
            <span>Reaches in {location.walkTime}</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17l-4 4m0 0l-4-4m4 4V3" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center ${
              location.status === 'open' ? 'text-green-600' : 'text-red-600'
            }`}>
              {location.status === 'open' ? 'Open' : 'Closed'}
            </span>
            <span>•</span>
            <span>
              {location.status === 'open'
                ? location.openingHours
                : location.reopenTime
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
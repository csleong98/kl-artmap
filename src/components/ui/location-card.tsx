import { Location } from '@/types';
import { Card, CardContent } from './card';
import { Badge } from './badge';

interface LocationCardProps {
  location: Location;
  onClick?: (location: Location) => void;
}

export default function LocationCard({ location, onClick }: LocationCardProps) {
  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 transition-colors border-0 shadow-none"
      onClick={() => onClick?.(location)}
    >
      <CardContent className="flex gap-3 p-4 md:p-3">
        {/* Placeholder image */}
        <div className="w-20 h-20 md:w-16 md:h-16 bg-muted rounded-lg flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">
            {location.name}
          </h3>
          <div className="text-sm text-muted-foreground space-y-1">
            {/* Train stations chips */}
            {location.nearestStations && location.nearestStations.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {location.nearestStations.map((station, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs"
                  >
                    {station}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status and admission indicators */}
              <Badge
                variant={location.status === 'open' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {location.status === 'open' ? 'Open' : 'Closed'}
              </Badge>

              {location.admission === 'free' && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                  Free
                </Badge>
              )}

              <span className="text-muted-foreground">
                {location.status === 'open'
                  ? location.openingHours
                  : location.reopenTime
                }
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
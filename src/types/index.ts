export interface ArtLocation {
  id: string;
  name: string;
  description?: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'mural' | 'gallery' | 'installation' | 'sculpture' | 'other';
  artist?: string;
  dateCreated?: string;
  imageUrl?: string;
}

export interface LocationDetails {
  overview: {
    description: string;
    admission: string;
    openingHours: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;
    };
    specialNote?: string;
  };
  stationGuide: {
    stations: {
      name: string;
      line: string;
      walkTime: number;
      walkDistance: string;
      routeInfo?: {
        distance: number;
        duration: number;
        routeGeometry?: any;
      };
    }[];
  };
  contact: {
    address: string;
    website?: string;
    phone?: string;
  };
}

export interface Location {
  name: string;
  type: 'art_gallery' | 'art_museum' | 'monument' | 'street_art';
  distance: string;
  walkTime: string;
  openingHours: string;
  status: 'open' | 'closed';
  reopenTime?: string;
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  imageUrl?: string;
  images?: string[];
  nearestStations?: string[];
  admission?: 'free' | 'paid';
  details?: LocationDetails;
}

export interface MapProps {
  className?: string;
  artLocations?: ArtLocation[];
}

export interface StationExit {
  exitName: string;
  coordinates: [number, number]; // [longitude, latitude]
  description?: string; // Optional description like "Near Central Market"
}

export type FilterType = 'all' | 'art_gallery' | 'art_museum' | 'monument';
export type TabType = 'art_museums' | 'art_galleries' | 'art_spaces' | 'overview' | 'station_guide' | 'contact';
export type PanelState = 'collapsed' | 'expanded';
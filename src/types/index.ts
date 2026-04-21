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
    pricing?: {
      ticketInfo?: string;
      ticketUrl?: string;
      prices: Array<{
        category: string;
        price: string;
      }>;
    };
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
      stationCode: string;
      stationName: string;
      line: string;
      walkTime: number;
      walkDistance: string;
      exitName?: string;
      exitDescription?: string;
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

// Indoor connections for covered walkways
export interface IndoorConnection {
  id: string;
  name: string;
  start: {
    name: string;
    coordinates: [number, number];
  };
  end: {
    name: string;
    coordinates: [number, number];
  };
  distance: number; // meters
  duration: number; // seconds
  type: 'mall' | 'underground' | 'skybridge' | 'covered_walkway';
  features: string[];
  openingHours?: string;
  instructions: string;
  isBidirectional: boolean;
}

// Train station within a line
export interface TrainStation {
  code: string; // e.g., "SBK15"
  name: string; // e.g., "Muzium Negara"
  coordinates: [number, number]; // [longitude, latitude]
  exits?: StationExit[];
  interchangeLines?: string[]; // IDs of other lines at this station
}

// Train line with all its stations
export interface TrainLine {
  id: string; // e.g., "mrt-kajang"
  name: string; // e.g., "MRT Kajang Line"
  shortName: string; // e.g., "Kajang Line"
  type: 'LRT' | 'MRT' | 'KTM' | 'Monorail' | 'ETS' | 'KLIA';
  color: string; // Brand color (e.g., "#98c355")
  stations: TrainStation[]; // Ordered list of stations
}

// Legacy: Old station data structure (for backwards compatibility)
export interface StationData {
  name: string;
  exits: StationExit[];
  lines: string[];
  type: 'LRT' | 'MRT' | 'KTM' | 'Monorail';
}

// Station with full metadata (returned by helper functions)
export interface StationWithMetadata {
  name: string;
  code: string;
  coordinates: [number, number];
  exits: StationExit[];
  lines: string[];
  type: 'LRT' | 'MRT' | 'KTM' | 'Monorail' | 'ETS' | 'KLIA';
  lineId: string;
  lineName: string;
  lineColor: string;
  distance?: number;
  interchangeLines?: string[];
}

export type FilterType = 'all' | 'art_gallery' | 'art_museum' | 'monument';
export type TabType = 'art_museums' | 'art_galleries' | 'art_spaces' | 'overview' | 'station_guide' | 'contact';
export type PanelState = 'collapsed' | 'expanded';
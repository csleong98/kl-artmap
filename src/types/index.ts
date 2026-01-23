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

export interface Location {
  id: string;
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
}

export interface MapProps {
  className?: string;
  artLocations?: ArtLocation[];
}

export type FilterType = 'all' | 'art_gallery' | 'art_museum' | 'monument';
export type TabType = 'places' | 'train_stations';
export type PanelState = 'collapsed' | 'expanded';
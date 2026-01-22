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

export interface MapProps {
  className?: string;
  artLocations?: ArtLocation[];
}
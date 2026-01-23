import { Location } from '@/types';

export const mockLocations: Location[] = [
  {
    id: '1',
    name: 'National Art Gallery',
    type: 'art_gallery',
    distance: '1km',
    walkTime: '15mins',
    openingHours: 'Closes at 5pm today',
    status: 'open',
    coordinates: [101.6869, 3.1390],
    address: 'Jalan Temerloh, Titiwangsa, 53200 Kuala Lumpur',
    imageUrl: '/images/national-art-gallery.jpg'
  },
  {
    id: '2',
    name: 'Wei-Ling Gallery',
    type: 'art_gallery',
    distance: '1km',
    walkTime: '15mins',
    openingHours: 'Closes at 5pm today',
    status: 'open',
    coordinates: [101.6869, 3.1390],
    address: '8, Jalan Scott, Brickfields, 50470 Kuala Lumpur',
    imageUrl: '/images/wei-ling-gallery.jpg'
  },
  {
    id: '3',
    name: 'KLCC Park',
    type: 'monument',
    distance: '2km',
    walkTime: '25mins',
    openingHours: 'Closes at 7pm today',
    status: 'open',
    coordinates: [101.7123, 3.1537],
    address: 'Kuala Lumpur City Centre, 50088 Kuala Lumpur',
    imageUrl: '/images/klcc-park.jpg'
  },
  {
    id: '4',
    name: 'Central Market',
    type: 'art_gallery',
    distance: '2km',
    walkTime: '25mins',
    openingHours: 'Closes at 7pm today',
    status: 'open',
    coordinates: [101.6958, 3.1412],
    address: 'Jalan Hang Kasturi, City Centre, 50050 Kuala Lumpur',
    imageUrl: '/images/central-market.jpg'
  },
  {
    id: '5',
    name: 'Islamic Arts Museum',
    type: 'art_museum',
    distance: '3km',
    walkTime: '35mins',
    openingHours: 'Reopens at 10am tomorrow',
    status: 'closed',
    reopenTime: '10am tomorrow',
    coordinates: [101.6890, 3.1319],
    address: 'Jalan Lembah, Tasik Perdana, 50480 Kuala Lumpur',
    imageUrl: '/images/islamic-arts-museum.jpg'
  }
];
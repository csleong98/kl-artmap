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
    coordinates: [101.7038, 3.1736], // Actual National Art Gallery location at Jalan Temerloh
    address: 'Jalan Temerloh, Titiwangsa, 53200 Kuala Lumpur',
    imageUrl: '/images/national-art-gallery.jpg',
    images: ['/images/national-art-gallery-1.jpg', '/images/national-art-gallery-2.jpg', '/images/national-art-gallery-3.jpg', '/images/national-art-gallery-4.jpg'],
    nearestStations: ['KLCC', 'Ampang Park', 'Persiaran KLCC'],
    admission: 'free',
    details: {
      overview: {
        description: 'Showcases the nation\'s financial history and artistic heritage through engaging exhibits and collections.',
        admission: 'Free',
        openingHours: {
          monday: 'Closed',
          tuesday: '10am - 5pm',
          wednesday: '10am - 5pm',
          thursday: '10am - 5pm',
          friday: '10am - 5pm',
          saturday: '10am - 5pm',
          sunday: '10am - 5pm'
        },
        specialNote: 'Closed on the first 3 days of Hari Raya Aidilfitri'
      },
      stationGuide: {
        stations: [
          {
            name: 'Bandaraya station',
            line: 'KTM',
            walkTime: 10,
            walkDistance: '0.8km'
          },
          {
            name: 'Bandaraya station',
            line: 'LRT Kelana Jaya Line',
            walkTime: 12,
            walkDistance: '1km'
          }
        ]
      },
      contact: {
        address: '5 Sasana Kijang, 2, Jalan Dato Onn, Kuala Lumpur, 50480 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
        website: 'https://museum.bnm.gov.my/',
        phone: '03-27846482'
      }
    }
  },
  {
    id: '2',
    name: 'Wei-Ling Gallery',
    type: 'art_gallery',
    distance: '1km',
    walkTime: '15mins',
    openingHours: 'Closes at 5pm today',
    status: 'open',
    coordinates: [101.6845, 3.1329], // Near Brickfields area
    address: '8, Jalan Scott, Brickfields, 50470 Kuala Lumpur',
    imageUrl: '/images/wei-ling-gallery.jpg',
    nearestStations: ['KL Sentral', 'Brickfields'],
    admission: 'free'
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
    imageUrl: '/images/klcc-park.jpg',
    nearestStations: ['KLCC', 'Ampang Park'],
    admission: 'free'
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
    imageUrl: '/images/central-market.jpg',
    nearestStations: ['Pasar Seni', 'Masjid Jamek LRT'],
    admission: 'free'
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
    imageUrl: '/images/islamic-arts-museum.jpg',
    nearestStations: ['KL Sentral', 'Muzium Negara MRT'],
    admission: 'paid'
  }
];
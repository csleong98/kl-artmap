import { Location } from '@/types';

export const mockLocations: Location[] = [
  {
    name: 'National Art Gallery',
    type: 'art_museum',
    distance:'1km',
    walkTime:'15mins',
    openingHours: 'Closes at 5pm today',
    status: 'open',
    coordinates: [101.6874, 3.1376], // Actual National Art Gallery location at Jalan Temerloh
    address: 'Jalan Temerloh, Titiwangsa, 53200 Kuala Lumpur',
    imageUrl: '/images/national-art-gallery.jpg',
    images: ['/images/national-art-gallery-1.jpg', '/images/national-art-gallery-2.jpg', '/images/national-art-gallery-3.jpg', '/images/national-art-gallery-4.jpg'],
    nearestStations:['KLCC', 'Ampang Park', 'Persiaran KLCC'],
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
    name: 'Bank Negara Malaysia Museum & Art Gallery',
    type: 'art_museum',
    distance:'1km',
    walkTime:'15mins',
    openingHours: 'Closes at 5pm today',
    status: 'open',
    coordinates: [101.6905, 3.1572],
    address: '8, Jalan Scott, Brickfields, 50470 Kuala Lumpur',
    imageUrl: '/images/wei-ling-gallery.jpg',
    nearestStations:['Bandaraya LRT'],
    admission: 'free'
  },
  {
    name: 'Ilham Gallery',
    type: 'art_museum',
    distance:'2km',
    walkTime:'25mins',
    openingHours: 'Closes at 7pm today',
    status: 'open',
    coordinates: [101.7187, 3.1590],
    address: 'Kuala Lumpur City Centre, 50088 Kuala Lumpur',
    imageUrl: '/images/klcc-park.jpg',
    nearestStations:['KLCC', 'Ampang Park'],
    admission: 'free'
  },
  {
    name: 'Galeri Petronas',
    type: 'art_museum',
    distance:'2km',
    walkTime:'25mins',
    openingHours: 'Closes at 7pm today',
    status: 'open',
    coordinates: [101.7121, 3.1581],
    address: 'Jalan Hang Kasturi, City Centre, 50050 Kuala Lumpur',
    imageUrl: '/images/central-market.jpg',
    nearestStations:['Pasar Seni', 'Masjid Jamek LRT'],
    admission: 'free'
  },
  {
    name: 'Islamic Arts Museum Malaysia',
    type: 'art_museum',
    distance:'3km',
    walkTime:'35mins',
    openingHours: 'Reopens at 10am tomorrow',
    status: 'closed',
    reopenTime: '10am tomorrow',
    coordinates: [101.6899, 3.1419],
    address: 'Jalan Lembah, Tasik Perdana, 50480 Kuala Lumpur',
    imageUrl: '/images/islamic-arts-museum.jpg',
    nearestStations:['KL Sentral', 'Muzium Negara MRT'],
    admission: 'paid'
  },
  {
    name: 'National Textile Museum',
    type: 'art_museum',
    distance:'3km',
    walkTime:'35mins',
    openingHours: 'Reopens at 10am tomorrow',
    status: 'closed',
    reopenTime: '10am tomorrow',
    coordinates: [101.6941, 3.1467],
    address: 'Jalan Lembah, Tasik Perdana, 50480 Kuala Lumpur',
    imageUrl: '/images/islamic-arts-museum.jpg',
    nearestStations:['KL Sentral', 'Muzium Negara MRT'],
    admission: 'paid'
  },
  {
    name: 'Sultan Abdul Samad Building',
    type: 'art_museum',
    distance:'3km',
    walkTime:'35mins',
    openingHours: 'Reopens at 10am tomorrow',
    status: 'closed',
    reopenTime: '10am tomorrow',
    coordinates: [101.6942, 3.1487],
    address: 'Jalan Lembah, Tasik Perdana, 50480 Kuala Lumpur',
    imageUrl: '/images/islamic-arts-museum.jpg',
    nearestStations:['KL Sentral', 'Muzium Negara MRT'],
    admission: 'paid'
  },
  {
    name: 'Telekom Museum',
    type: 'art_museum',
    distance:'3km',
    walkTime:'35mins',
    openingHours: 'Reopens at 10am tomorrow',
    status: 'closed',
    reopenTime: '10am tomorrow',
    coordinates: [101.6994, 3.1489],
    address: 'Jalan Lembah, Tasik Perdana, 50480 Kuala Lumpur',
    imageUrl: '/images/islamic-arts-museum.jpg',
    nearestStations:['KL Sentral', 'Muzium Negara MRT'],
    admission: 'paid'
  },
  {
    name: 'UR-MU Bukit Bintang',
    type: 'art_gallery',
    distance:'2km',
    walkTime:'20mins',
    openingHours: 'Closes at 8:30pm today',
    status: 'open',
    coordinates: [101.7117, 3.1462],
    address: '3, Jalan Bedara, Bukit Bintang, 50200 Kuala Lumpur',
    nearestStations:['Bukit Bintang MRT', 'Bukit Bintang Monorail'],
    admission: 'paid'
  },
  {
    name: 'UR-MU The Toffee',
    type: 'art_gallery',
    distance:'2km',
    walkTime:'20mins',
    openingHours: 'Closes at 8:30pm today',
    status: 'open',
    coordinates: [101.7078, 3.1515],
    address: '2, Jalan Raja Chulan, City Centre, 50100 Kuala Lumpur',
    nearestStations:['Raja Chulan Monorail'],
    admission: 'paid'
  },
  {
    name: 'UR-MU Tun H.S. Lee',
    type: 'art_gallery',
    distance:'3km',
    walkTime:'25mins',
    openingHours: 'Closes at 8:30pm today',
    status: 'open',
    coordinates: [101.6967, 3.1453],
    address: '131 & 133, Jalan Tun HS Lee, 50000 Kuala Lumpur',
    nearestStations:['Pasar Seni LRT', 'Pasar Seni MRT'],
    admission: 'paid'
  },
  {
    name: 'Kwai Chai Hong',
    type: 'street_art',
    distance:'3km',
    walkTime:'25mins',
    openingHours: 'Closes at 12am today',
    status: 'open',
    coordinates: [101.6968, 3.1440],
    address: 'Lorong Panggung, 50000 Kuala Lumpur',
    nearestStations:['Pasar Seni LRT', 'Pasar Seni MRT'],
    admission: 'free'
  }
];
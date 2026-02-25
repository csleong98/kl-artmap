// Indoor connections database for KL walkways
// These are indoor/covered routes that Mapbox doesn't know about

export interface IndoorConnection {
  id: string;
  name: string;
  start: {
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  end: {
    name: string;
    coordinates: [number, number];
  };
  distance: number;         // meters
  duration: number;         // seconds
  type: 'mall' | 'underground' | 'skybridge' | 'covered_walkway';
  features: string[];
  openingHours?: string;
  instructions: string;
  isBidirectional: boolean; // Can walk both directions
}

/**
 * Indoor connections in Kuala Lumpur
 * Sources:
 * - NU Sentral connection: https://www.tripadvisor.com/FAQ_Answers-g298570-d6599717-t2002753
 * - Muzium Negara MRT walkway: https://museumvolunteersjmm.com/2017/07/22/mrt-link-muzium-negara-to-kl-sentral/
 * - Pasar Seni connection: https://en.wikipedia.org/wiki/Pasar_Seni_station
 */
export const indoorConnections: IndoorConnection[] = [
  // ============================================
  // KL SENTRAL AREA
  // ============================================

  {
    id: 'kl-sentral-nu-sentral',
    name: 'KL Sentral ↔ NU Sentral Mall',
    start: {
      name: 'KL Sentral Level 2',
      coordinates: [101.6860, 3.1340]
    },
    end: {
      name: 'NU Sentral Shopping Centre',
      coordinates: [101.6869, 3.1334]
    },
    distance: 150,
    duration: 120, // 2 mins
    type: 'mall',
    features: ['air-conditioned', 'escalators', 'wheelchair accessible', 'restrooms'],
    openingHours: '5:30am - 12:00am daily',
    instructions: 'From KL Sentral, take escalator to Level 2 Connection Level. Walk straight into NU Sentral shopping mall.',
    isBidirectional: true
  },

  {
    id: 'nu-sentral-muzium-negara',
    name: 'NU Sentral ↔ Muzium Negara MRT',
    start: {
      name: 'NU Sentral Shopping Centre',
      coordinates: [101.6869, 3.1334]
    },
    end: {
      name: 'Muzium Negara MRT Entrance C',
      coordinates: [101.6878, 3.1375]
    },
    distance: 240,
    duration: 180, // 3 mins
    type: 'covered_walkway',
    features: ['covered', 'elevated walkway', 'escalators', 'wheelchair accessible'],
    instructions: 'Exit NU Sentral and follow the covered elevated walkway. The 240m walkway connects to Muzium Negara MRT Entrance C.',
    isBidirectional: true
  },

  // Direct composite route (KL Sentral → Muzium Negara via NU Sentral)
  {
    id: 'kl-sentral-muzium-negara-via-nu',
    name: 'KL Sentral → Muzium Negara MRT (via NU Sentral)',
    start: {
      name: 'KL Sentral Level 2',
      coordinates: [101.6860, 3.1340]
    },
    end: {
      name: 'Muzium Negara MRT Entrance C',
      coordinates: [101.6878, 3.1375]
    },
    distance: 390, // 150 + 240
    duration: 300, // 5 mins total
    type: 'mall',
    features: ['air-conditioned', 'covered', 'escalators', 'wheelchair accessible', 'restrooms'],
    openingHours: '5:30am - 12:00am daily',
    instructions: 'From KL Sentral Level 2, walk through NU Sentral mall (air-conditioned), then follow covered elevated walkway to Muzium Negara MRT.',
    isBidirectional: true
  },

  // ============================================
  // PASAR SENI AREA
  // ============================================

  {
    id: 'pasar-seni-lrt-mrt',
    name: 'Pasar Seni LRT ↔ Pasar Seni MRT',
    start: {
      name: 'Pasar Seni LRT Station',
      coordinates: [101.69531, 3.14247]
    },
    end: {
      name: 'Pasar Seni MRT Station',
      coordinates: [101.6953, 3.1422]
    },
    distance: 65,
    duration: 60, // 1 min
    type: 'skybridge',
    features: ['covered', 'paid-to-paid link', 'escalators', 'lifts'],
    instructions: 'Pedestrian bridge over Jalan Sultan Mohamed connects LRT Concourse Level to MRT Concourse Level. Paid area connection.',
    isBidirectional: true
  },

  {
    id: 'pasar-seni-central-market',
    name: 'Pasar Seni Station ↔ Central Market',
    start: {
      name: 'Pasar Seni LRT/MRT Entrance A',
      coordinates: [101.6947, 3.1419]
    },
    end: {
      name: 'Central Market Main Entrance',
      coordinates: [101.6953, 3.1422]
    },
    distance: 80,
    duration: 90, // 1.5 mins
    type: 'covered_walkway',
    features: ['covered', 'heritage building', 'shopping'],
    openingHours: '10:00am - 9:00pm daily',
    instructions: 'Exit Pasar Seni station Entrance A. Central Market is directly adjacent - short covered walk to the heritage building entrance.',
    isBidirectional: true
  }
];

/**
 * Find indoor connections that can be used between two points
 * @param from Starting coordinates
 * @param to Ending coordinates
 * @param maxDetourMeters Allow this much detour to use indoor route (default 100m)
 * @returns Array of relevant indoor connections
 */
export function findRelevantIndoorConnections(
  from: [number, number],
  to: [number, number],
  maxDetourMeters: number = 100
): IndoorConnection[] {
  const relevant: IndoorConnection[] = [];

  for (const connection of indoorConnections) {
    // Calculate distance from 'from' point to connection start
    const distToStart = haversineMeters(from, connection.start.coordinates);
    const distFromEnd = haversineMeters(connection.end.coordinates, to);

    // Check if connection is useful (within acceptable detour)
    if (distToStart <= maxDetourMeters && distFromEnd <= maxDetourMeters) {
      relevant.push(connection);
    }

    // Check reverse direction if bidirectional
    if (connection.isBidirectional) {
      const distToEnd = haversineMeters(from, connection.end.coordinates);
      const distFromStart = haversineMeters(connection.start.coordinates, to);

      if (distToEnd <= maxDetourMeters && distFromStart <= maxDetourMeters) {
        // Create reversed connection
        relevant.push({
          ...connection,
          id: `${connection.id}-reverse`,
          name: connection.name.split('↔').reverse().join('↔'),
          start: connection.end,
          end: connection.start,
        });
      }
    }
  }

  return relevant;
}

/**
 * Haversine distance between two [lng, lat] points in meters
 */
function haversineMeters(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6_371_000; // Earth radius in meters
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const sin2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
}

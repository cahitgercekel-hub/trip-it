export interface POI {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: 'Culture' | 'Nature';
  isFree: boolean;
  price: number;
  hasISIC: boolean;
  dTicket: boolean;
  estimatedSteps: number;
  country: 'DE' | 'AT';
}

/**
 * Estimate visit duration in minutes based on steps and category.
 * Museums/palaces (Culture with high steps or paid entry) → longer visits.
 * Free landmarks/photo stops → shorter visits.
 * Nature/parks → moderate based on size.
 */
export function getVisitMinutes(poi: POI): number {
  if (poi.category === 'Culture') {
    // Paid museums / palaces get longer visits
    if (!poi.isFree && poi.price >= 10) return Math.max(90, Math.round(poi.estimatedSteps / 40));
    if (!poi.isFree) return Math.max(60, Math.round(poi.estimatedSteps / 50));
    // Free landmarks / photo stops
    if (poi.estimatedSteps <= 1500) return 25;
    if (poi.estimatedSteps <= 2000) return 35;
    return Math.max(40, Math.round(poi.estimatedSteps / 60));
  }
  // Nature
  if (poi.estimatedSteps >= 7000) return 90;
  if (poi.estimatedSteps >= 5000) return 60;
  if (poi.estimatedSteps >= 3000) return 45;
  return 30;
}

export interface City {
  id: string;
  name: string;
  country: 'DE' | 'AT';
  center: [number, number];
  zoom: number;
  airportIATA: string;
  pois: POI[];
}

export const CITIES_DATA: City[] = [
  // ── GERMANY ──
  {
    id: 'berlin', name: 'Berlin', country: 'DE', center: [52.52, 13.405], zoom: 12, airportIATA: 'BER',
    pois: [
      { id: 'ber1', name: 'Brandenburg Gate', lat: 52.5163, lng: 13.3777, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 2000, country: 'DE' },
      { id: 'ber2', name: 'Museum Island', lat: 52.5169, lng: 13.4019, category: 'Culture', isFree: false, price: 19, hasISIC: true, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'ber3', name: 'Tiergarten', lat: 52.5145, lng: 13.3501, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 8000, country: 'DE' },
      { id: 'ber4', name: 'East Side Gallery', lat: 52.5052, lng: 13.4398, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'ber5', name: 'Tempelhofer Feld', lat: 52.4733, lng: 13.4017, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 6000, country: 'DE' },
      { id: 'ber6', name: 'Berliner Dom', lat: 52.5191, lng: 13.4015, category: 'Culture', isFree: false, price: 10, hasISIC: true, dTicket: true, estimatedSteps: 2000, country: 'DE' },
      { id: 'ber7', name: 'Treptower Park', lat: 52.4862, lng: 13.4692, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'ber8', name: 'Reichstag Building', lat: 52.5186, lng: 13.3761, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 2000, country: 'DE' },
    ],
  },
  {
    id: 'munich', name: 'Munich', country: 'DE', center: [48.1351, 11.582], zoom: 13, airportIATA: 'MUC',
    pois: [
      { id: 'muc1', name: 'Marienplatz', lat: 48.1374, lng: 11.5755, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 2000, country: 'DE' },
      { id: 'muc2', name: 'Englischer Garten', lat: 48.1642, lng: 11.6054, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 10000, country: 'DE' },
      { id: 'muc3', name: 'Nymphenburg Palace', lat: 48.1583, lng: 11.5033, category: 'Culture', isFree: false, price: 15, hasISIC: true, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'muc4', name: 'Viktualienmarkt', lat: 48.1351, lng: 11.5763, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 2000, country: 'DE' },
      { id: 'muc5', name: 'Olympiapark', lat: 48.1735, lng: 11.5461, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 6000, country: 'DE' },
      { id: 'muc6', name: 'Alte Pinakothek', lat: 48.1483, lng: 11.5699, category: 'Culture', isFree: false, price: 7, hasISIC: true, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'muc7', name: 'Hofgarten', lat: 48.1433, lng: 11.5797, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'muc8', name: 'Residenz München', lat: 48.1416, lng: 11.5791, category: 'Culture', isFree: false, price: 9, hasISIC: true, dTicket: true, estimatedSteps: 3000, country: 'DE' },
    ],
  },
  {
    id: 'hamburg', name: 'Hamburg', country: 'DE', center: [53.5511, 9.9937], zoom: 12, airportIATA: 'HAM',
    pois: [
      { id: 'ham1', name: 'Elbphilharmonie Plaza', lat: 53.5413, lng: 9.9842, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 2000, country: 'DE' },
      { id: 'ham2', name: 'Planten un Blomen', lat: 53.5614, lng: 9.9812, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'ham3', name: 'Speicherstadt', lat: 53.5438, lng: 9.9988, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'ham4', name: 'Miniatur Wunderland', lat: 53.5433, lng: 10.0001, category: 'Culture', isFree: false, price: 21, hasISIC: true, dTicket: true, estimatedSteps: 4000, country: 'DE' },
      { id: 'ham5', name: 'Alster Lakes', lat: 53.5600, lng: 10.0000, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 6000, country: 'DE' },
      { id: 'ham6', name: 'Stadtpark', lat: 53.5960, lng: 10.0254, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'ham7', name: 'Kunsthalle Hamburg', lat: 53.5529, lng: 10.0028, category: 'Culture', isFree: false, price: 16, hasISIC: true, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'ham8', name: 'St. Pauli Landungsbrücken', lat: 53.5459, lng: 9.9668, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 3000, country: 'DE' },
    ],
  },
  {
    id: 'cologne', name: 'Cologne', country: 'DE', center: [50.9375, 6.9603], zoom: 13, airportIATA: 'CGN',
    pois: [
      { id: 'col1', name: 'Cologne Cathedral', lat: 50.9413, lng: 6.9583, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 2000, country: 'DE' },
      { id: 'col2', name: 'Rheinpark', lat: 50.9433, lng: 6.9783, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'col3', name: 'Museum Ludwig', lat: 50.9405, lng: 6.9624, category: 'Culture', isFree: false, price: 13, hasISIC: true, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'col4', name: 'Flora Botanical Garden', lat: 50.9600, lng: 6.9700, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 4000, country: 'DE' },
      { id: 'col5', name: 'Hohenzollern Bridge', lat: 50.9415, lng: 6.9651, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 2000, country: 'DE' },
      { id: 'col6', name: 'Stadtwald', lat: 50.9210, lng: 6.9250, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 7000, country: 'DE' },
      { id: 'col7', name: 'Chocolate Museum', lat: 50.9322, lng: 6.9640, category: 'Culture', isFree: false, price: 14, hasISIC: true, dTicket: true, estimatedSteps: 2000, country: 'DE' },
      { id: 'col8', name: 'Old Town (Altstadt)', lat: 50.9379, lng: 6.9596, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 3000, country: 'DE' },
    ],
  },
  {
    id: 'frankfurt', name: 'Frankfurt', country: 'DE', center: [50.1109, 8.6821], zoom: 13, airportIATA: 'FRA',
    pois: [
      { id: 'fra1', name: 'Römerberg', lat: 50.1106, lng: 8.6821, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 2000, country: 'DE' },
      { id: 'fra2', name: 'Palmengarten', lat: 50.1233, lng: 8.6567, category: 'Nature', isFree: false, price: 7, hasISIC: true, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'fra3', name: 'Städel Museum', lat: 50.1052, lng: 8.6723, category: 'Culture', isFree: false, price: 16, hasISIC: true, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'fra4', name: 'Main River Promenade', lat: 50.1067, lng: 8.6826, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 4000, country: 'DE' },
      { id: 'fra5', name: 'Grüneburgpark', lat: 50.1268, lng: 8.6627, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 4000, country: 'DE' },
      { id: 'fra6', name: 'Frankfurt Cathedral', lat: 50.1108, lng: 8.6854, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 1500, country: 'DE' },
      { id: 'fra7', name: 'Senckenberg Museum', lat: 50.1176, lng: 8.6517, category: 'Culture', isFree: false, price: 12, hasISIC: true, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'fra8', name: 'Nizza Park', lat: 50.1065, lng: 8.6710, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 2000, country: 'DE' },
    ],
  },
  {
    id: 'stuttgart', name: 'Stuttgart', country: 'DE', center: [48.7758, 9.1829], zoom: 13, airportIATA: 'STR',
    pois: [
      { id: 'stu1', name: 'Schlossplatz', lat: 48.7784, lng: 9.1800, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 2000, country: 'DE' },
      { id: 'stu2', name: 'Killesbergpark', lat: 48.8015, lng: 9.1715, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'stu3', name: 'Mercedes-Benz Museum', lat: 48.7882, lng: 9.2340, category: 'Culture', isFree: false, price: 12, hasISIC: true, dTicket: true, estimatedSteps: 4000, country: 'DE' },
      { id: 'stu4', name: 'Staatsgalerie', lat: 48.7774, lng: 9.1865, category: 'Culture', isFree: false, price: 9, hasISIC: true, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'stu5', name: 'Rosensteinpark', lat: 48.8025, lng: 9.2070, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'stu6', name: 'Wilhelma Zoo', lat: 48.8049, lng: 9.2063, category: 'Nature', isFree: false, price: 20, hasISIC: true, dTicket: true, estimatedSteps: 6000, country: 'DE' },
      { id: 'stu7', name: 'Old Castle', lat: 48.7785, lng: 9.1796, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 1500, country: 'DE' },
      { id: 'stu8', name: 'Max-Eyth-See', lat: 48.8217, lng: 9.2309, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 5000, country: 'DE' },
    ],
  },
  {
    id: 'dusseldorf', name: 'Düsseldorf', country: 'DE', center: [51.2277, 6.7735], zoom: 13, airportIATA: 'DUS',
    pois: [
      { id: 'dus1', name: 'Altstadt (Old Town)', lat: 51.2263, lng: 6.7724, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'dus2', name: 'Hofgarten', lat: 51.2320, lng: 6.7835, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 4000, country: 'DE' },
      { id: 'dus3', name: 'K21 Kunstsammlung', lat: 51.2194, lng: 6.7833, category: 'Culture', isFree: false, price: 14, hasISIC: true, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'dus4', name: 'Rheinuferpromenade', lat: 51.2245, lng: 6.7710, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 4000, country: 'DE' },
      { id: 'dus5', name: 'MedienHafen', lat: 51.2162, lng: 6.7612, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'dus6', name: 'Nordpark', lat: 51.2530, lng: 6.7440, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'dus7', name: 'Schloss Benrath', lat: 51.1625, lng: 6.8706, category: 'Culture', isFree: false, price: 10, hasISIC: true, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'dus8', name: 'Kaiserswerth Ruins', lat: 51.3016, lng: 6.7334, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 3000, country: 'DE' },
    ],
  },
  {
    id: 'leipzig', name: 'Leipzig', country: 'DE', center: [51.3397, 12.3731], zoom: 13, airportIATA: 'LEJ',
    pois: [
      { id: 'lei1', name: 'Monument to the Battle of the Nations', lat: 51.3127, lng: 12.4132, category: 'Culture', isFree: false, price: 10, hasISIC: true, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'lei2', name: 'Clara-Zetkin-Park', lat: 51.3290, lng: 12.3550, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'lei3', name: 'St. Thomas Church', lat: 51.3389, lng: 12.3721, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 1500, country: 'DE' },
      { id: 'lei4', name: 'Leipzig Zoo', lat: 51.3502, lng: 12.3697, category: 'Nature', isFree: false, price: 23, hasISIC: true, dTicket: true, estimatedSteps: 6000, country: 'DE' },
      { id: 'lei5', name: 'Augustusplatz', lat: 51.3384, lng: 12.3815, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 2000, country: 'DE' },
      { id: 'lei6', name: 'Cospudener See', lat: 51.2762, lng: 12.3492, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 7000, country: 'DE' },
      { id: 'lei7', name: 'Grassi Museum', lat: 51.3372, lng: 12.3872, category: 'Culture', isFree: false, price: 8, hasISIC: true, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'lei8', name: 'Johannapark', lat: 51.3330, lng: 12.3660, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 3000, country: 'DE' },
    ],
  },
  {
    id: 'nuremberg', name: 'Nuremberg', country: 'DE', center: [49.4521, 11.0767], zoom: 13, airportIATA: 'NUE',
    pois: [
      { id: 'nur1', name: 'Imperial Castle', lat: 49.4579, lng: 11.0757, category: 'Culture', isFree: false, price: 7, hasISIC: true, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'nur2', name: 'Stadtpark', lat: 49.4500, lng: 11.1000, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 4000, country: 'DE' },
      { id: 'nur3', name: 'Germanisches Nationalmuseum', lat: 49.4478, lng: 11.0756, category: 'Culture', isFree: false, price: 8, hasISIC: true, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'nur4', name: 'Hauptmarkt', lat: 49.4537, lng: 11.0779, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 1500, country: 'DE' },
      { id: 'nur5', name: 'Tiergarten Nürnberg', lat: 49.4479, lng: 11.1493, category: 'Nature', isFree: false, price: 16, hasISIC: true, dTicket: true, estimatedSteps: 6000, country: 'DE' },
      { id: 'nur6', name: 'Pegnitz River Walk', lat: 49.4530, lng: 11.0830, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'nur7', name: 'Documentation Center', lat: 49.4318, lng: 11.1284, category: 'Culture', isFree: false, price: 6, hasISIC: true, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'nur8', name: 'Dutzendteich Park', lat: 49.4350, lng: 11.1230, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 4000, country: 'DE' },
    ],
  },
  {
    id: 'dresden', name: 'Dresden', country: 'DE', center: [51.0504, 13.7373], zoom: 13, airportIATA: 'DRS',
    pois: [
      { id: 'dre1', name: 'Frauenkirche', lat: 51.0519, lng: 13.7413, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 1500, country: 'DE' },
      { id: 'dre2', name: 'Großer Garten', lat: 51.0393, lng: 13.7620, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 6000, country: 'DE' },
      { id: 'dre3', name: 'Zwinger Palace', lat: 51.0533, lng: 13.7345, category: 'Culture', isFree: false, price: 14, hasISIC: true, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'dre4', name: 'Brühl\'s Terrace', lat: 51.0535, lng: 13.7443, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 2000, country: 'DE' },
      { id: 'dre5', name: 'Elbe Meadows', lat: 51.0570, lng: 13.7680, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'dre6', name: 'Green Vault', lat: 51.0531, lng: 13.7363, category: 'Culture', isFree: false, price: 14, hasISIC: true, dTicket: true, estimatedSteps: 2000, country: 'DE' },
      { id: 'dre7', name: 'Pillnitz Castle Park', lat: 51.0073, lng: 13.8691, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'dre8', name: 'Semperoper', lat: 51.0543, lng: 13.7353, category: 'Culture', isFree: false, price: 13, hasISIC: true, dTicket: true, estimatedSteps: 1500, country: 'DE' },
    ],
  },
  {
    id: 'heidelberg', name: 'Heidelberg', country: 'DE', center: [49.3988, 8.6724], zoom: 14, airportIATA: 'FRA',
    pois: [
      { id: 'hei1', name: 'Heidelberg Castle', lat: 49.4106, lng: 8.7153, category: 'Culture', isFree: false, price: 9, hasISIC: true, dTicket: true, estimatedSteps: 4000, country: 'DE' },
      { id: 'hei2', name: 'Philosopher\'s Walk', lat: 49.4135, lng: 8.7050, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'hei3', name: 'Old Bridge', lat: 49.4134, lng: 8.7103, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 1500, country: 'DE' },
      { id: 'hei4', name: 'Heiligenberg', lat: 49.4240, lng: 8.7000, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 7000, country: 'DE' },
      { id: 'hei5', name: 'University Library', lat: 49.4098, lng: 8.7063, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 1500, country: 'DE' },
      { id: 'hei6', name: 'Neckar Meadows', lat: 49.4100, lng: 8.6800, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 3000, country: 'DE' },
      { id: 'hei7', name: 'Church of the Holy Spirit', lat: 49.4116, lng: 8.7068, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 1000, country: 'DE' },
      { id: 'hei8', name: 'Botanical Garden', lat: 49.4139, lng: 8.6977, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 3000, country: 'DE' },
    ],
  },
  {
    id: 'freiburg', name: 'Freiburg', country: 'DE', center: [47.999, 7.842], zoom: 13, airportIATA: 'BSL',
    pois: [
      { id: 'fre1', name: 'Freiburg Minster', lat: 47.9957, lng: 7.8529, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 1500, country: 'DE' },
      { id: 'fre2', name: 'Schlossberg', lat: 47.9955, lng: 7.8610, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 5000, country: 'DE' },
      { id: 'fre3', name: 'Augustinermuseum', lat: 47.9936, lng: 7.8504, category: 'Culture', isFree: false, price: 7, hasISIC: true, dTicket: true, estimatedSteps: 2000, country: 'DE' },
      { id: 'fre4', name: 'Seepark', lat: 48.0020, lng: 7.8250, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 4000, country: 'DE' },
      { id: 'fre5', name: 'Münsterplatz', lat: 47.9959, lng: 7.8524, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 1000, country: 'DE' },
      { id: 'fre6', name: 'Dreisam River Path', lat: 47.9890, lng: 7.8600, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 4000, country: 'DE' },
      { id: 'fre7', name: 'Colombischlössle Museum', lat: 47.9929, lng: 7.8478, category: 'Culture', isFree: false, price: 5, hasISIC: true, dTicket: true, estimatedSteps: 1500, country: 'DE' },
      { id: 'fre8', name: 'Stadtgarten', lat: 47.9980, lng: 7.8450, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: true, estimatedSteps: 3000, country: 'DE' },
    ],
  },
  // ── AUSTRIA ──
  {
    id: 'vienna', name: 'Vienna', country: 'AT', center: [48.2082, 16.3738], zoom: 13, airportIATA: 'VIE',
    pois: [
      { id: 'vie1', name: 'Schönbrunn Palace', lat: 48.1845, lng: 16.3122, category: 'Culture', isFree: false, price: 22, hasISIC: true, dTicket: false, estimatedSteps: 5000, country: 'AT' },
      { id: 'vie2', name: 'Prater Park', lat: 48.2165, lng: 16.3958, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 6000, country: 'AT' },
      { id: 'vie3', name: 'St. Stephen\'s Cathedral', lat: 48.2082, lng: 16.3738, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 1500, country: 'AT' },
      { id: 'vie4', name: 'Belvedere Palace', lat: 48.1913, lng: 16.3809, category: 'Culture', isFree: false, price: 16, hasISIC: true, dTicket: false, estimatedSteps: 3000, country: 'AT' },
      { id: 'vie5', name: 'Stadtpark', lat: 48.2040, lng: 16.3793, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 3000, country: 'AT' },
      { id: 'vie6', name: 'Kunsthistorisches Museum', lat: 48.2038, lng: 16.3616, category: 'Culture', isFree: false, price: 18, hasISIC: true, dTicket: false, estimatedSteps: 4000, country: 'AT' },
      { id: 'vie7', name: 'Donauinsel', lat: 48.2280, lng: 16.4100, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 7000, country: 'AT' },
      { id: 'vie8', name: 'Hofburg Palace', lat: 48.2066, lng: 16.3656, category: 'Culture', isFree: false, price: 17, hasISIC: true, dTicket: false, estimatedSteps: 3000, country: 'AT' },
    ],
  },
  {
    id: 'salzburg', name: 'Salzburg', country: 'AT', center: [47.8095, 13.055], zoom: 14, airportIATA: 'SZG',
    pois: [
      { id: 'sal1', name: 'Hohensalzburg Fortress', lat: 47.7953, lng: 13.0476, category: 'Culture', isFree: false, price: 13, hasISIC: true, dTicket: false, estimatedSteps: 4000, country: 'AT' },
      { id: 'sal2', name: 'Mirabell Gardens', lat: 47.8049, lng: 13.0418, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 2000, country: 'AT' },
      { id: 'sal3', name: 'Mozart\'s Birthplace', lat: 47.8003, lng: 13.0434, category: 'Culture', isFree: false, price: 12, hasISIC: true, dTicket: false, estimatedSteps: 1500, country: 'AT' },
      { id: 'sal4', name: 'Salzburg Cathedral', lat: 47.7973, lng: 13.0462, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 1000, country: 'AT' },
      { id: 'sal5', name: 'Kapuzinerberg', lat: 47.8010, lng: 13.0530, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 5000, country: 'AT' },
      { id: 'sal6', name: 'Salzburg Museum', lat: 47.7987, lng: 13.0440, category: 'Culture', isFree: false, price: 9, hasISIC: true, dTicket: false, estimatedSteps: 2000, country: 'AT' },
      { id: 'sal7', name: 'Hellbrunn Palace Park', lat: 47.7627, lng: 13.0604, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 5000, country: 'AT' },
      { id: 'sal8', name: 'Getreidegasse', lat: 47.7997, lng: 13.0436, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 2000, country: 'AT' },
    ],
  },
  {
    id: 'graz', name: 'Graz', country: 'AT', center: [47.0707, 15.4395], zoom: 14, airportIATA: 'GRZ',
    pois: [
      { id: 'gra1', name: 'Schlossberg', lat: 47.0764, lng: 15.4374, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 4000, country: 'AT' },
      { id: 'gra2', name: 'Kunsthaus Graz', lat: 47.0716, lng: 15.4342, category: 'Culture', isFree: false, price: 11, hasISIC: true, dTicket: false, estimatedSteps: 2000, country: 'AT' },
      { id: 'gra3', name: 'Hauptplatz', lat: 47.0713, lng: 15.4381, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 1000, country: 'AT' },
      { id: 'gra4', name: 'Stadtpark Graz', lat: 47.0755, lng: 15.4487, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 3000, country: 'AT' },
      { id: 'gra5', name: 'Eggenberg Palace', lat: 47.0778, lng: 15.3916, category: 'Culture', isFree: false, price: 17, hasISIC: true, dTicket: false, estimatedSteps: 4000, country: 'AT' },
      { id: 'gra6', name: 'Murinsel', lat: 47.0722, lng: 15.4349, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 1000, country: 'AT' },
      { id: 'gra7', name: 'Augarten Park', lat: 47.0830, lng: 15.4420, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 3000, country: 'AT' },
      { id: 'gra8', name: 'Landeszeughaus', lat: 47.0709, lng: 15.4406, category: 'Culture', isFree: false, price: 10, hasISIC: true, dTicket: false, estimatedSteps: 2000, country: 'AT' },
    ],
  },
  {
    id: 'innsbruck', name: 'Innsbruck', country: 'AT', center: [47.2692, 11.4041], zoom: 14, airportIATA: 'INN',
    pois: [
      { id: 'inn1', name: 'Golden Roof', lat: 47.2685, lng: 11.3932, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 1000, country: 'AT' },
      { id: 'inn2', name: 'Nordkette Cable Car', lat: 47.3117, lng: 11.3880, category: 'Nature', isFree: false, price: 39, hasISIC: true, dTicket: false, estimatedSteps: 3000, country: 'AT' },
      { id: 'inn3', name: 'Hofburg Innsbruck', lat: 47.2680, lng: 11.3942, category: 'Culture', isFree: false, price: 10, hasISIC: true, dTicket: false, estimatedSteps: 2000, country: 'AT' },
      { id: 'inn4', name: 'Ambras Castle', lat: 47.2562, lng: 11.4349, category: 'Culture', isFree: false, price: 12, hasISIC: true, dTicket: false, estimatedSteps: 4000, country: 'AT' },
      { id: 'inn5', name: 'Hofgarten', lat: 47.2705, lng: 11.3918, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 2000, country: 'AT' },
      { id: 'inn6', name: 'Bergisel Ski Jump', lat: 47.2488, lng: 11.3938, category: 'Culture', isFree: false, price: 11, hasISIC: true, dTicket: false, estimatedSteps: 3000, country: 'AT' },
      { id: 'inn7', name: 'Inn River Promenade', lat: 47.2650, lng: 11.3950, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 4000, country: 'AT' },
      { id: 'inn8', name: 'Alpine Zoo', lat: 47.2850, lng: 11.3920, category: 'Nature', isFree: false, price: 13, hasISIC: true, dTicket: false, estimatedSteps: 4000, country: 'AT' },
    ],
  },
  {
    id: 'linz', name: 'Linz', country: 'AT', center: [48.3069, 14.2858], zoom: 13, airportIATA: 'LNZ',
    pois: [
      { id: 'lin1', name: 'Ars Electronica Center', lat: 48.3095, lng: 14.2842, category: 'Culture', isFree: false, price: 12, hasISIC: true, dTicket: false, estimatedSteps: 3000, country: 'AT' },
      { id: 'lin2', name: 'Donaupark', lat: 48.3130, lng: 14.2900, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 4000, country: 'AT' },
      { id: 'lin3', name: 'Hauptplatz', lat: 48.3067, lng: 14.2865, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 1000, country: 'AT' },
      { id: 'lin4', name: 'Pöstlingberg', lat: 48.3183, lng: 14.2567, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 5000, country: 'AT' },
      { id: 'lin5', name: 'Lentos Art Museum', lat: 48.3086, lng: 14.2830, category: 'Culture', isFree: false, price: 10, hasISIC: true, dTicket: false, estimatedSteps: 2000, country: 'AT' },
      { id: 'lin6', name: 'Botanical Garden', lat: 48.3050, lng: 14.2730, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 3000, country: 'AT' },
      { id: 'lin7', name: 'Linz Castle', lat: 48.3083, lng: 14.2870, category: 'Culture', isFree: false, price: 7, hasISIC: true, dTicket: false, estimatedSteps: 2000, country: 'AT' },
      { id: 'lin8', name: 'Wasserwald', lat: 48.2850, lng: 14.3100, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 5000, country: 'AT' },
    ],
  },
  {
    id: 'bregenz', name: 'Bregenz', country: 'AT', center: [47.5031, 9.7471], zoom: 14, airportIATA: 'FDH',
    pois: [
      { id: 'bre1', name: 'Pfänder Mountain', lat: 47.5090, lng: 9.7880, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 6000, country: 'AT' },
      { id: 'bre2', name: 'Kunsthaus Bregenz', lat: 47.5031, lng: 9.7456, category: 'Culture', isFree: false, price: 12, hasISIC: true, dTicket: false, estimatedSteps: 2000, country: 'AT' },
      { id: 'bre3', name: 'Bregenz Lakefront', lat: 47.5040, lng: 9.7430, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 3000, country: 'AT' },
      { id: 'bre4', name: 'Oberstadt (Upper Town)', lat: 47.5058, lng: 9.7478, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 2000, country: 'AT' },
      { id: 'bre5', name: 'Bregenz Festival Stage', lat: 47.5050, lng: 9.7380, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 1500, country: 'AT' },
      { id: 'bre6', name: 'Gebhardsberg', lat: 47.4990, lng: 9.7600, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 5000, country: 'AT' },
      { id: 'bre7', name: 'Martinsturm', lat: 47.5055, lng: 9.7480, category: 'Culture', isFree: false, price: 4, hasISIC: false, dTicket: false, estimatedSteps: 1000, country: 'AT' },
      { id: 'bre8', name: 'Rappenlochschlucht', lat: 47.4700, lng: 9.7750, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 7000, country: 'AT' },
    ],
  },
  {
    id: 'klagenfurt', name: 'Klagenfurt', country: 'AT', center: [46.6247, 14.3053], zoom: 13, airportIATA: 'KLU',
    pois: [
      { id: 'kla1', name: 'Minimundus', lat: 46.6180, lng: 14.2635, category: 'Culture', isFree: false, price: 19, hasISIC: true, dTicket: false, estimatedSteps: 3000, country: 'AT' },
      { id: 'kla2', name: 'Europapark', lat: 46.6210, lng: 14.2680, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 4000, country: 'AT' },
      { id: 'kla3', name: 'Alter Platz', lat: 46.6244, lng: 14.3075, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 1000, country: 'AT' },
      { id: 'kla4', name: 'Wörthersee Lakefront', lat: 46.6240, lng: 14.2770, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 5000, country: 'AT' },
      { id: 'kla5', name: 'Landesmuseum', lat: 46.6250, lng: 14.3100, category: 'Culture', isFree: false, price: 8, hasISIC: true, dTicket: false, estimatedSteps: 2000, country: 'AT' },
      { id: 'kla6', name: 'Kreuzbergl', lat: 46.6330, lng: 14.3020, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 4000, country: 'AT' },
      { id: 'kla7', name: 'Dragon Fountain', lat: 46.6245, lng: 14.3068, category: 'Culture', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 500, country: 'AT' },
      { id: 'kla8', name: 'Botanical Garden', lat: 46.6180, lng: 14.2800, category: 'Nature', isFree: true, price: 0, hasISIC: false, dTicket: false, estimatedSteps: 2000, country: 'AT' },
    ],
  },
];

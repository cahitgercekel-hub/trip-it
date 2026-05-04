import { POI } from '@/data/cities';

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getTotalDistance(pois: POI[]): number {
  let total = 0;
  for (let i = 0; i < pois.length - 1; i++) {
    total += haversine(pois[i].lat, pois[i].lng, pois[i + 1].lat, pois[i + 1].lng);
  }
  return total;
}

export function getTotalSteps(pois: POI[]): number {
  return Math.round(getTotalDistance(pois) * 1350);
}

export function getEstimatedCost(pois: POI[], isicActive: boolean, dTicketMode: boolean, days: number = 1): number {
  // Realistically, a traveler visits 3-5 paid attractions per day.
  // We'll sum the average costs of the filtered POIs, capped at 4 per day.
  const maxPoisToSum = Math.max(1, Math.min(pois.length, days * 4));
  
  // Sort by price to get a "middle-ground" or "realistic high" estimate
  const sortedPois = [...pois].sort((a, b) => b.price - a.price);
  const poisToSum = sortedPois.slice(0, maxPoisToSum);

  const attractionCost = poisToSum.reduce((sum, poi) => {
    const price = isicActive && poi.hasISIC ? poi.price * 0.5 : poi.price;
    return sum + price;
  }, 0);

  const transitCost = (dTicketMode ? 0 : 9) * days;
  const foodCost = 25 * days;

  return attractionCost + transitCost + foodCost;
}

/* ─── Transport estimation ─── */

// Walking speed ~4.5 km/h, biking ~15 km/h, transit avg ~25 km/h incl. stops, taxi ~30 km/h
const SPEED = { walk: 4.5, bike: 15, transit: 25, taxi: 30 };

export type TransportMode = 'walk' | 'transit' | 'bike' | 'taxi';

export interface TransportRecommendation {
  mode: TransportMode;
  distanceKm: number;
  totalMinutes: number;
  walkMinutes: number;
  rideMinutes: number;
  waitMinutes: number;
  transitType: string; // e.g. "S-Bahn", "U-Bahn", "Tram", ""
  label: string; // e.g. "Walk to next stop", "Take Public Transit"
  walkingAdjusted: boolean; // true if mode changed due to walking goal
  walkingTag: string; // explanatory tag text or ""
}

/**
 * Pick transit sub-type based on distance:
 * < 2km → Tram, 2-5km → U-Bahn, >5km → S-Bahn
 */
function pickTransitType(distKm: number): string {
  if (distKm < 2) return 'Tram';
  if (distKm < 5) return 'U-Bahn';
  return 'S-Bahn';
}

/**
 * Determine the best transport mode given distance and the user's step goal.
 * Higher step goals → more willingness to walk longer segments.
 *
 * walkThresholdKm: max distance the user is willing to walk in one segment.
 * Derived from stepGoal: stepGoal / 1350 steps-per-km gives total daily walk km,
 * divide by expected number of segments (~6) for per-segment threshold.
 */
export function getTransportRecommendation(
  distanceKm: number,
  stepGoal: number,
  dTicketMode: boolean,
): TransportRecommendation {
  // Per-segment walk threshold based on daily step goal
  const dailyWalkKm = stepGoal / 1350;
  const walkThresholdKm = Math.max(0.4, dailyWalkKm / 6);

  const canWalk = distanceKm <= walkThresholdKm;
  const wouldDefaultWalk = distanceKm <= 1.0; // baseline: most people walk < 1km

  let mode: TransportMode;
  let walkingAdjusted = false;
  let walkingTag = '';

  if (canWalk) {
    mode = 'walk';
    if (!wouldDefaultWalk) {
      walkingAdjusted = true;
      walkingTag = 'Walking-friendly route';
    }
  } else if (distanceKm > 5 && !dTicketMode) {
    mode = 'taxi';
    if (wouldDefaultWalk) {
      walkingAdjusted = true;
      walkingTag = 'Adjusted for low walking preference';
    }
  } else {
    mode = 'transit';
    if (wouldDefaultWalk) {
      walkingAdjusted = true;
      walkingTag = 'Transit recommended based on your walking goal';
    }
  }

  const walkMinutes = Math.round((distanceKm / SPEED.walk) * 60);

  let totalMinutes: number;
  let rideMinutes = 0;
  let waitMinutes = 0;
  let transitType = '';
  let label = '';

  switch (mode) {
    case 'walk':
      totalMinutes = walkMinutes;
      label = 'Walk to next stop';
      break;
    case 'transit': {
      transitType = pickTransitType(distanceKm);
      const walkToStop = Math.round(Math.min(distanceKm * 0.2, 0.4) / SPEED.walk * 60); // ~20% or 400m walk to stop
      waitMinutes = distanceKm < 2 ? 3 : 4;
      rideMinutes = Math.round((distanceKm * 0.8) / SPEED.transit * 60);
      totalMinutes = walkToStop + waitMinutes + rideMinutes;
      label = 'Take Public Transit';
      break;
    }
    case 'taxi':
      rideMinutes = Math.round((distanceKm / SPEED.taxi) * 60);
      totalMinutes = rideMinutes + 2;
      waitMinutes = 2;
      label = 'Take Taxi';
      break;
    default:
      totalMinutes = walkMinutes;
      label = 'Walk to next stop';
  }

  return {
    mode,
    distanceKm,
    totalMinutes: Math.max(totalMinutes, 1),
    walkMinutes: mode === 'walk' ? totalMinutes : Math.round(Math.min(distanceKm * 0.2, 0.4) / SPEED.walk * 60),
    rideMinutes,
    waitMinutes,
    transitType,
    label,
    walkingAdjusted,
    walkingTag,
  };
}

/**
 * Optimizes a list of POIs by finding a logical path using the Nearest Neighbor algorithm (TSP).
 * Starting from the POI closest to the city center (or first provided).
 */
export function optimizeRouteTSP(pois: POI[]): POI[] {
  if (pois.length <= 2) return pois;

  const remaining = [...pois];
  const optimized: POI[] = [];

  // Start with the POI that is generally "first" (or closest to index 0)
  let current = remaining.shift()!;
  optimized.push(current);

  while (remaining.length > 0) {
    let closestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversine(current.lat, current.lng, remaining[i].lat, remaining[i].lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    }

    current = remaining.splice(closestIdx, 1)[0];
    optimized.push(current);
  }

  return optimized;
}

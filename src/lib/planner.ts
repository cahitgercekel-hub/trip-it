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

export function getEstimatedCost(pois: POI[], isicActive: boolean): number {
  return pois.reduce((sum, poi) => {
    const price = isicActive && poi.hasISIC ? poi.price * 0.5 : poi.price;
    return sum + price;
  }, 0);
}

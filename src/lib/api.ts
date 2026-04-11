import type { POI } from '@/data/cities';

const API_BASE = 'http://localhost:8000';

export interface ItineraryRequest {
  starting_location: string;
  start_datetime: string;
  end_datetime: string;
  travel_interests: string;
  travel_pace: string;
  available_pois: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    category: string;
    isFree: boolean;
    price: number;
    hasISIC: boolean;
    dTicket: boolean;
    estimatedSteps: number;
    country: string;
  }[];
}

export interface ItineraryResponse {
  status: string;
  itinerary: string;
}

export function buildItineraryRequest(
  cityName: string,
  pois: POI[],
  dayStartTime: string,
  dayEndTime: string,
  tripInterests: string[],
  stepGoal: number,
): ItineraryRequest {
  const pace = stepGoal >= 12000 ? 'Fast-paced' : stepGoal >= 7000 ? 'Moderate' : 'Relaxed';
  const interests = tripInterests.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ');

  // Use today's date as placeholder
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  return {
    starting_location: cityName,
    start_datetime: `${dateStr} ${dayStartTime}`,
    end_datetime: `${dateStr} ${dayEndTime}`,
    travel_interests: interests,
    travel_pace: pace,
    available_pois: pois.map(p => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      category: p.category,
      isFree: p.isFree,
      price: p.price,
      hasISIC: p.hasISIC,
      dTicket: p.dTicket,
      estimatedSteps: p.estimatedSteps,
      country: p.country,
    })),
  };
}

export async function generateItinerary(request: ItineraryRequest): Promise<ItineraryResponse> {
  const response = await fetch(`${API_BASE}/api/generate-itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json();
}

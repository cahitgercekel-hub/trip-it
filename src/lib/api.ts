import type { POI } from '@/data/cities';

// Read from env so deployments can point at a real HTTPS backend.
// Falls back to localhost only for local development.
const RAW_API_BASE = (import.meta.env.VITE_ITINERARY_API_BASE as string | undefined) ?? 'http://localhost:8000';
const API_BASE = RAW_API_BASE.replace(/\/+$/, '');

if (import.meta.env.PROD && API_BASE.startsWith('http://') && !/^http:\/\/localhost(:|$)/.test(API_BASE)) {
  // eslint-disable-next-line no-console
  console.warn('[api] Itinerary API base is plain HTTP in production — switch to HTTPS via VITE_ITINERARY_API_BASE.');
}

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
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  // Attach the current Supabase JWT (if a user is signed in) so the backend can
  // authenticate the caller and prevent anonymous abuse.
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch {
    // Auth client unavailable — proceed without token.
  }

  const response = await fetch(`${API_BASE}/api/generate-itinerary`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json();
}

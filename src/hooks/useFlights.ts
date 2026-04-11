import { useState, useEffect, useRef, useCallback } from 'react';

export interface FlightResult {
  cheapestPrice: number;
  routeCount: number;
  currency: string;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const clientId = import.meta.env.VITE_AMADEUS_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Amadeus credentials not configured');
  }

  const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  });

  if (!res.ok) throw new Error('Token fetch failed');

  const data = await res.json();
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

export function useFlights(originIATA: string, destIATA: string) {
  const [result, setResult] = useState<FlightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchFlights = useCallback(async () => {
    if (!originIATA || !destIATA) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(false);

    try {
      const token = await getAccessToken();
      const res = await fetch(
        `https://test.api.amadeus.com/v1/shopping/flight-destinations?origin=${originIATA}&maxPrice=300&oneWay=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        }
      );

      if (!res.ok) throw new Error('Flight search failed');

      const data = await res.json();
      const flights = data.data || [];

      // Filter to destination
      const toDestination = flights.filter(
        (f: any) => f.destination === destIATA
      );

      if (toDestination.length > 0) {
        const cheapest = Math.min(...toDestination.map((f: any) => parseFloat(f.price.total)));
        setResult({
          cheapestPrice: cheapest,
          routeCount: toDestination.length,
          currency: toDestination[0].price.currency || 'EUR',
        });
      } else if (flights.length > 0) {
        // Show cheapest overall if no direct match
        const cheapest = Math.min(...flights.map((f: any) => parseFloat(f.price.total)));
        setResult({
          cheapestPrice: cheapest,
          routeCount: flights.length,
          currency: flights[0].price.currency || 'EUR',
        });
      } else {
        setResult(null);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(true);
        setResult(null);
      }
    } finally {
      setLoading(false);
    }
  }, [originIATA, destIATA]);

  useEffect(() => {
    fetchFlights();
    return () => abortRef.current?.abort();
  }, [fetchFlights]);

  return { result, loading, error };
}

import { useState, useEffect, useRef, useCallback } from 'react';

const WMO_MAP: Record<number, { label: string; icon: string }> = {
  0:  { label: 'Clear sky',           icon: '☀️' },
  1:  { label: 'Mainly clear',        icon: '🌤️' },
  2:  { label: 'Partly cloudy',       icon: '⛅' },
  3:  { label: 'Overcast',            icon: '☁️' },
  45: { label: 'Foggy',               icon: '🌫️' },
  48: { label: 'Icy fog',             icon: '🌫️' },
  51: { label: 'Light drizzle',       icon: '🌦️' },
  53: { label: 'Drizzle',             icon: '🌧️' },
  55: { label: 'Heavy drizzle',       icon: '🌧️' },
  61: { label: 'Light rain',          icon: '🌧️' },
  63: { label: 'Rain',                icon: '🌧️' },
  65: { label: 'Heavy rain',          icon: '🌧️' },
  71: { label: 'Light snow',          icon: '🌨️' },
  73: { label: 'Snow',                icon: '❄️' },
  75: { label: 'Heavy snow',          icon: '❄️' },
  80: { label: 'Rain showers',        icon: '🌦️' },
  81: { label: 'Showers',             icon: '🌧️' },
  82: { label: 'Violent showers',     icon: '⛈️' },
  95: { label: 'Thunderstorm',        icon: '⛈️' },
  99: { label: 'Thunderstorm + hail', icon: '⛈️' },
};

export interface WeatherData {
  temp: number;
  windSpeed: number;
  precipitation: number;
  code: number;
  label: string;
  isRainy: boolean;
  icon: string;
}

export function useWeather(lat: number, lng: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      setError(false);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode,precipitation,windspeed_10m&timezone=auto&forecast_days=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      const current = data.current;
      const code = current.weathercode as number;
      const wmo = WMO_MAP[code] || { label: 'Unknown', icon: '🌡️' };

      setWeather({
        temp: Math.round(current.temperature_2m),
        windSpeed: Math.round(current.windspeed_10m),
        precipitation: current.precipitation,
        code,
        label: wmo.label,
        isRainy: code >= 51,
        icon: wmo.icon,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    setLoading(true);
    setWeather(null);
    fetchWeather();

    // Re-fetch every 30 minutes
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchWeather]);

  return { weather, loading, error };
}

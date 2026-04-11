import { useWeather, WeatherData } from '@/hooks/useWeather';
import { usePlanner } from '@/context/PlannerContext';
import { motion } from 'framer-motion';
import { Shirt, Droplets, Sun, Umbrella, Wind, Footprints, Sparkles } from 'lucide-react';

function getPackingSuggestions(weather: WeatherData) {
  const clothing: string[] = [];
  const skincare: string[] = [];
  const notes: string[] = [];

  // Temperature-based clothing
  if (weather.temp <= 0) {
    clothing.push('🧥 Heavy winter coat', '🧣 Scarf & gloves', '🧤 Warm hat');
  } else if (weather.temp <= 10) {
    clothing.push('🧥 Warm jacket', '👖 Long pants', '🧣 Light scarf');
  } else if (weather.temp <= 18) {
    clothing.push('🧥 Light jacket', '👕 Long sleeves', '👖 Jeans');
  } else if (weather.temp <= 25) {
    clothing.push('👕 T-shirt', '🩳 Shorts or light pants', '👟 Breathable shoes');
  } else {
    clothing.push('👕 Light tee', '🩳 Shorts', '🧢 Sun hat', '🕶️ Sunglasses');
  }

  // Weather-based notes
  if (weather.isRainy) {
    notes.push('☂️ Bring an umbrella');
    clothing.push('🧥 Waterproof layer');
  }
  if (weather.windSpeed > 25) {
    notes.push('💨 Windy — secure loose items');
  }
  if (weather.temp > 22 && !weather.isRainy) {
    skincare.push('🧴 Sunscreen SPF 30+');
    skincare.push('💧 Lip balm with SPF');
  }
  if (weather.temp < 5) {
    skincare.push('🧴 Rich moisturizer');
    skincare.push('💋 Lip balm');
  }
  if (weather.temp >= 5 && weather.temp <= 22) {
    skincare.push('🧴 Light moisturizer');
  }

  notes.push('👟 Comfy walking shoes');
  if (weather.precipitation > 2) {
    notes.push('🥾 Waterproof footwear');
  }

  return { clothing, skincare, notes };
}

function getForecastIcon(code: number): string {
  if (code >= 95) return '⛈️';
  if (code >= 80) return '🌦️';
  if (code >= 71) return '🌨️';
  if (code >= 51) return '🌧️';
  if (code >= 45) return '🌫️';
  if (code >= 3) return '☁️';
  if (code >= 1) return '🌤️';
  return '☀️';
}

export function WeatherPackingCard() {
  const { selectedCity } = usePlanner();
  const { weather, loading, error } = useWeather(selectedCity.center[0], selectedCity.center[1]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 shadow-card space-y-3 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-16 bg-muted rounded-lg" />
        <div className="h-12 bg-muted rounded-lg" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
        <p className="text-xs text-muted-foreground">Weather data unavailable</p>
      </div>
    );
  }

  const suggestions = getPackingSuggestions(weather);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base">🌤️</span>
          <span className="text-sm font-bold text-foreground">Weather & Packing</span>
        </div>
        <p className="text-[11px] text-muted-foreground">What to wear & bring today</p>
      </div>

      {/* Forecast card */}
      <div className="mx-3 mb-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{weather.icon}</span>
            <div>
              <p className="text-lg font-bold text-foreground leading-none">{weather.temp}°C</p>
              <p className="text-[11px] text-muted-foreground">{weather.label}</p>
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end">
              <Wind className="w-3 h-3" /> {weather.windSpeed} km/h
            </p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end">
              <Droplets className="w-3 h-3" /> {weather.precipitation} mm
            </p>
          </div>
        </div>
      </div>

      {/* Clothing */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Shirt className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Clothing</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.clothing.map((item, i) => (
            <span key={i} className="text-[11px] bg-secondary text-foreground px-2 py-1 rounded-md">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Skincare */}
      {suggestions.skincare.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Skincare</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.skincare.map((item, i) => (
              <span key={i} className="text-[11px] bg-secondary text-foreground px-2 py-1 rounded-md">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="px-4 pb-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Umbrella className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Notes</span>
        </div>
        <div className="space-y-1">
          {suggestions.notes.map((note, i) => (
            <p key={i} className="text-[11px] text-muted-foreground">{note}</p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

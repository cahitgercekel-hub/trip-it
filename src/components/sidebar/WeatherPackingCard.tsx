import { useWeather, WeatherData } from '@/hooks/useWeather';
import { usePlanner } from '@/context/PlannerContext';
import { motion } from 'framer-motion';
import { Shirt, Droplets, Sun, Umbrella, Wind, Footprints, Sparkles } from 'lucide-react';

function getPackingSuggestions(weather: WeatherData, lang: string) {
  const isDe = lang === 'de';
  const clothing: string[] = [];
  const skincare: string[] = [];
  const notes: string[] = [];

  // Temperature-based clothing
  if (weather.temp <= 0) {
    clothing.push(isDe ? '🧥 Wintermantel' : '🧥 Heavy winter coat', isDe ? '🧣 Schal & Handschuhe' : '🧣 Scarf & gloves', isDe ? '🧤 Mütze' : '🧤 Warm hat');
  } else if (weather.temp <= 10) {
    clothing.push(isDe ? '🧥 Warme Jacke' : '🧥 Warm jacket', isDe ? '👖 Lange Hose' : '👖 Long pants', isDe ? '🧣 Leichter Schal' : '🧣 Light scarf');
  } else if (weather.temp <= 18) {
    clothing.push(isDe ? '🧥 Leichte Jacke' : '🧥 Light jacket', isDe ? '👕 Langarmshirt' : '👕 Long sleeves', isDe ? '👖 Jeans' : '👖 Jeans');
  } else if (weather.temp <= 25) {
    clothing.push(isDe ? '👕 T-Shirt' : '👕 T-shirt', isDe ? '🩳 Shorts/leichte Hose' : '🩳 Shorts or light pants', isDe ? '👟 Atmungsaktive Schuhe' : '👟 Breathable shoes');
  } else {
    clothing.push(isDe ? '👕 Leichtes Shirt' : '👕 Light tee', isDe ? '🩳 Shorts' : '🩳 Shorts', isDe ? '🧢 Sonnenhut' : '🧢 Sun hat', isDe ? '🕶️ Sonnenbrille' : '🕶️ Sunglasses');
  }

  // Weather-based notes
  if (weather.isRainy) {
    notes.push(isDe ? '☂️ Regenschirm mitnehmen' : '☂️ Bring an umbrella');
    clothing.push(isDe ? '🧥 Regenjacke' : '🧥 Waterproof layer');
  }
  if (weather.windSpeed > 25) {
    notes.push(isDe ? '💨 Windig — lose Gegenstände sichern' : '💨 Windy — secure loose items');
  }
  if (weather.temp > 22 && !weather.isRainy) {
    skincare.push(isDe ? '🧴 Sonnencreme LSF 30+' : '🧴 Sunscreen SPF 30+');
    skincare.push(isDe ? '💧 Lippenpflege mit LSF' : '💧 Lip balm with SPF');
  }
  if (weather.temp < 5) {
    skincare.push(isDe ? '🧴 Reichhaltige Creme' : '🧴 Rich moisturizer');
    skincare.push(isDe ? '💋 Lippenpflege' : '💋 Lip balm');
  }
  
  notes.push(isDe ? '👟 Bequeme Wanderschuhe' : '👟 Comfy walking shoes');

  return { clothing, skincare, notes };
}

export function WeatherPackingCard() {
  const { selectedCity, t, lang } = usePlanner();
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
        <p className="text-xs text-muted-foreground">{t('weatherUnavailable')}</p>
      </div>
    );
  }

  const suggestions = getPackingSuggestions(weather, lang);

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
          <span className="text-sm font-bold text-foreground">{t('weatherPacking')}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">{t('whatToWear')}</p>
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
          <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">{t('clothing')}</span>
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
            <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">{t('skincare')}</span>
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
          <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">{t('notes')}</span>
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

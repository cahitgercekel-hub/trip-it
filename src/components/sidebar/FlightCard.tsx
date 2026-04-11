import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, ExternalLink } from 'lucide-react';
import { useFlights } from '@/hooks/useFlights';
import { usePlanner } from '@/context/PlannerContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const EU_HUBS = [
  { label: 'London', iata: 'LON', flag: '🇬🇧' },
  { label: 'Paris', iata: 'PAR', flag: '🇫🇷' },
  { label: 'Amsterdam', iata: 'AMS', flag: '🇳🇱' },
  { label: 'Madrid', iata: 'MAD', flag: '🇪🇸' },
  { label: 'Istanbul', iata: 'IST', flag: '🇹🇷' },
];

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function FlightCard({ collapsed }: { collapsed: boolean }) {
  const { selectedCity } = usePlanner();
  const [hubIndex, setHubIndex] = useState(0);
  const hub = EU_HUBS[hubIndex];
  const { result, loading, error } = useFlights(hub.iata, selectedCity.airportIATA);

  const openGoogleFlights = () => {
    const url = `https://www.google.com/flights?hl=en#flt=${hub.iata}.${selectedCity.airportIATA}.${getTomorrowDate()}`;
    window.open(url, '_blank');
  };

  // Collapsed state
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-0.5 py-2 cursor-default">
            <Plane className="w-4 h-4 text-muted-foreground" />
            {result && (
              <span className="text-[10px] font-bold text-primary">€{Math.round(result.cheapestPrice)}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-foreground text-background text-xs px-2 py-1">
          {result
            ? `Flights from ${hub.label} — from €${Math.round(result.cheapestPrice)}`
            : `Flights to ${selectedCity.name}`}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="rounded-xl p-3 bg-gradient-to-br from-indigo-950 to-slate-900 border border-border animate-pulse">
        <div className="h-4 w-32 bg-slate-700 rounded mb-3" />
        <div className="h-6 w-20 bg-slate-700 rounded mb-3" />
        <div className="h-3 w-28 bg-slate-700 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-3 bg-gradient-to-br from-indigo-950 to-slate-900 border border-border text-primary-foreground"
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <Plane className="w-3.5 h-3.5 opacity-80" />
        <span className="text-sm font-medium opacity-90">Flights to {selectedCity.name}</span>
      </div>

      {/* Hub selector */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-xs opacity-70">From</span>
        <select
          value={hubIndex}
          onChange={(e) => setHubIndex(Number(e.target.value))}
          className="bg-white/10 border border-white/15 rounded-full px-2.5 py-1 text-xs font-medium text-primary-foreground cursor-pointer hover:bg-white/15 transition-colors appearance-none"
          style={{ paddingRight: '1.5rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'%23ffffff80\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center' }}
        >
          {EU_HUBS.map((h, i) => (
            <option key={h.iata} value={i} className="bg-slate-900 text-white">
              {h.flag} {h.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price / error */}
      {error || !result ? (
        <p className="text-xs text-muted-foreground">No flights found</p>
      ) : (
        <>
          <div className="mb-1">
            <span className="text-xs opacity-60 block">From</span>
            <span className="text-2xl font-bold text-primary">€{Math.round(result.cheapestPrice)}</span>
            <span className="text-xs opacity-60 ml-1.5">· cheapest fare</span>
          </div>
          <p className="text-xs opacity-60 mb-3">{result.routeCount} route{result.routeCount !== 1 ? 's' : ''} found</p>
        </>
      )}

      {/* CTA */}
      <button
        onClick={openGoogleFlights}
        className="w-full flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
      >
        Search on Google Flights
        <ExternalLink className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

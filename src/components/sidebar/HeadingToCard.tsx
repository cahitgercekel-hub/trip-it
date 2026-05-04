import { usePlanner } from '@/context/PlannerContext';
import { CITIES_DATA, City } from '@/data/cities';
import { MapPin, Search } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CitySelectionMap } from '@/components/CitySelectionMap';

export function HeadingToCard() {
  const { cityId, setCityId, selectedCity, t } = usePlanner();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return CITIES_DATA;
    const q = query.toLowerCase();
    return CITIES_DATA.filter(c =>
      c.name.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (city: City) => {
    setCityId(city.id);
    setQuery('');
    setOpen(false);
  };

  const displayValue = open ? query : (selectedCity ? selectedCity.name : '');

  return (
    <div 
      className={cn(
        "flex flex-col shadow-card rounded-xl border border-border relative transition-all",
        open ? "z-[100]" : "z-10"
      )} 
      ref={wrapperRef}
    >
      <div className="bg-card p-3.5 pb-2 rounded-t-xl">
        <div className="flex items-center gap-2 mb-2.5">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">{t('headingTo')}</span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={displayValue}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => { setQuery(''); setOpen(true); }}
            placeholder={selectedCity ? selectedCity.name : t('selectCity')}
            className={cn(
              "w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
              !open && selectedCity ? "font-bold text-foreground" : "text-foreground font-normal"
            )}
          />

          {open && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {filtered.map(city => (
                <button
                  key={city.id}
                  onClick={() => handleSelect(city)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-secondary transition-colors ${
                    city.id === cityId ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                  }`}
                >
                  <span>🇩🇪</span>
                  <span>{city.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Map Selection Component (Integrated) */}
      <CitySelectionMap />
    </div>
  );
}

import { usePlanner } from '@/context/PlannerContext';
import { CITIES_DATA, City } from '@/data/cities';
import { MapPin, Search } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';

export function HeadingToCard() {
  const { cityId, setCityId, setCountry, selectedCity, country } = usePlanner();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return CITIES_DATA;
    const q = query.toLowerCase();
    return CITIES_DATA.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      (c.country === 'DE' ? 'germany' : 'austria').includes(q)
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
    if (city.country !== country) setCountry(city.country);
    setCityId(city.id);
    setQuery('');
    setOpen(false);
  };

  const placeholder = selectedCity
    ? `${selectedCity.country === 'DE' ? 'Germany' : 'Austria'} / ${selectedCity.name}`
    : 'Country / City / Landmark';

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 shadow-card" ref={wrapperRef}>
      <div className="flex items-center gap-2 mb-2.5">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-foreground">Heading to</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground placeholder:italic focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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
                <span>{city.country === 'DE' ? '🇩🇪' : '🇦🇹'}</span>
                <span>{city.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

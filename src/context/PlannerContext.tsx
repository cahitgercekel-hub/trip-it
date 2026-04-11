import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { CITIES_DATA, City, POI } from '@/data/cities';
import { getTotalDistance, getTotalSteps, getEstimatedCost } from '@/lib/planner';

interface PlannerState {
  country: 'DE' | 'AT';
  cityId: string;
  stepGoal: number;
  budget: number;
  dTicketMode: boolean;
  freeOnly: boolean;
  isicActive: boolean;
  rainyFilter: boolean;
  mapFilter: 'All' | 'Culture' | 'Nature';
}

interface PlannerContextType extends PlannerState {
  setCountry: (c: 'DE' | 'AT') => void;
  setCityId: (id: string) => void;
  setStepGoal: (n: number) => void;
  setBudget: (n: number) => void;
  setDTicketMode: (b: boolean) => void;
  setFreeOnly: (b: boolean) => void;
  setIsicActive: (b: boolean) => void;
  setRainyFilter: (b: boolean) => void;
  setMapFilter: (f: 'All' | 'Culture' | 'Nature') => void;
  cities: City[];
  selectedCity: City;
  filteredPois: POI[];
  stats: { poiCount: number; cost: number; steps: number; distance: number };
}

const PlannerContext = createContext<PlannerContextType | null>(null);

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be inside PlannerProvider');
  return ctx;
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [country, setCountryRaw] = useState<'DE' | 'AT'>('DE');
  const [cityId, setCityId] = useState('berlin');
  const [stepGoal, setStepGoal] = useState(8000);
  const [budget, setBudget] = useState(25);
  const [dTicketMode, setDTicketMode] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [isicActive, setIsicActive] = useState(false);
  const [rainyFilter, setRainyFilter] = useState(false);
  const [mapFilter, setMapFilter] = useState<'All' | 'Culture' | 'Nature'>('All');

  const setCountry = (c: 'DE' | 'AT') => {
    setCountryRaw(c);
    const firstCity = CITIES_DATA.find(city => city.country === c);
    if (firstCity) setCityId(firstCity.id);
    if (c === 'AT') setDTicketMode(false);
  };

  const cities = useMemo(() => CITIES_DATA.filter(c => c.country === country), [country]);
  const selectedCity = useMemo(() => CITIES_DATA.find(c => c.id === cityId) || CITIES_DATA[0], [cityId]);

  const filteredPois = useMemo(() => {
    let pois = selectedCity.pois;

    // Rainy weather: filter out Nature POIs
    if (rainyFilter) {
      pois = pois.filter(p => p.category === 'Culture');
    }

    if (freeOnly) pois = pois.filter(p => p.isFree);
    if (dTicketMode && country === 'DE') pois = pois.filter(p => p.dTicket);

    pois = pois.filter(p => {
      const price = isicActive && p.hasISIC ? p.price * 0.5 : p.price;
      return price <= budget;
    });

    if (mapFilter !== 'All') pois = pois.filter(p => p.category === mapFilter);

    return pois;
  }, [selectedCity, rainyFilter, freeOnly, dTicketMode, country, budget, isicActive, mapFilter]);

  const stats = useMemo(() => ({
    poiCount: filteredPois.length,
    cost: Math.round(getEstimatedCost(filteredPois, isicActive)),
    steps: getTotalSteps(filteredPois),
    distance: getTotalDistance(filteredPois),
  }), [filteredPois, isicActive]);

  return (
    <PlannerContext.Provider value={{
      country, cityId, stepGoal, budget, dTicketMode, freeOnly, isicActive, rainyFilter, mapFilter,
      setCountry, setCityId, setStepGoal, setBudget, setDTicketMode, setFreeOnly, setIsicActive,
      setRainyFilter, setMapFilter,
      cities, selectedCity, filteredPois, stats,
    }}>
      {children}
    </PlannerContext.Provider>
  );
}

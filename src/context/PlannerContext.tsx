import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { CITIES_DATA, City, POI } from '@/data/cities';
import { buildItineraryRequest, generateItinerary } from '@/lib/api';
import { getTotalDistance, getTotalSteps, getEstimatedCost } from '@/lib/planner';

function getStoredTime(key: string, fallback: string): string {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

interface PlannerState {
  country: 'DE' | 'AT';
  cityId: string;
  stepGoal: number;
  budget: number;
  dTicketMode: boolean;
  freeOnly: boolean;
  isicActive: boolean;
  rainyFilter: boolean;
  tripInterests: string[];
  tripGenerated: boolean;
  tripLoading: boolean;
  loadingStep: number;
  dayStartTime: string;
  dayEndTime: string;
  aiItinerary: string | null;
}

const LOADING_STEPS = [
  'Analyze User Preference...',
  'Retrieve Resources...',
  'Searched Top Attractions...',
  'Searched Accommodations and Hotels...',
  'Transportation Overview...',
  'Local Guide...',
  'Creating Itinerary...',
];

interface PlannerContextType extends PlannerState {
  setCountry: (c: 'DE' | 'AT') => void;
  setCityId: (id: string) => void;
  setStepGoal: (n: number) => void;
  setBudget: (n: number) => void;
  setDTicketMode: (b: boolean) => void;
  setFreeOnly: (b: boolean) => void;
  setIsicActive: (b: boolean) => void;
  setRainyFilter: (b: boolean) => void;
  toggleTripInterest: (id: string) => void;
  setTripGenerated: (b: boolean) => void;
  generateTrip: () => void;
  aiItinerary: string | null;
  setDayStartTime: (t: string) => void;
  setDayEndTime: (t: string) => void;
  dayStartMinutes: number;
  dayEndMinutes: number;
  loadingSteps: string[];
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

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
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
  const [tripInterests, setTripInterests] = useState<string[]>(['culture', 'nature']);
  const [tripGenerated, setTripGenerated] = useState(false);
  const [tripLoading, setTripLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [dayStartTime, setDayStartTimeRaw] = useState(() => getStoredTime('tageplan_start_time', '09:00'));
  const [dayEndTime, setDayEndTimeRaw] = useState(() => getStoredTime('tageplan_end_time', '21:00'));
  const [aiItinerary, setAiItinerary] = useState<string | null>(null);

  const setDayStartTime = (t: string) => {
    setDayStartTimeRaw(t);
    try { localStorage.setItem('tageplan_start_time', t); } catch {}
    // Auto-fix end time if needed
    if (timeToMinutes(t) >= timeToMinutes(dayEndTime)) {
      const fixed = timeToMinutes(t) + 60;
      const fixedStr = `${String(Math.floor(fixed / 60)).padStart(2, '0')}:${String(fixed % 60).padStart(2, '0')}`;
      setDayEndTimeRaw(fixedStr);
      try { localStorage.setItem('tageplan_end_time', fixedStr); } catch {}
    }
  };

  const setDayEndTime = (t: string) => {
    if (timeToMinutes(t) <= timeToMinutes(dayStartTime)) {
      const fixed = timeToMinutes(dayStartTime) + 60;
      const fixedStr = `${String(Math.floor(fixed / 60)).padStart(2, '0')}:${String(fixed % 60).padStart(2, '0')}`;
      setDayEndTimeRaw(fixedStr);
      try { localStorage.setItem('tageplan_end_time', fixedStr); } catch {}
    } else {
      setDayEndTimeRaw(t);
      try { localStorage.setItem('tageplan_end_time', t); } catch {}
    }
  };

  const dayStartMinutes = useMemo(() => timeToMinutes(dayStartTime), [dayStartTime]);
  const dayEndMinutes = useMemo(() => timeToMinutes(dayEndTime), [dayEndTime]);

  const toggleTripInterest = (id: string) => {
    setTripInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

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
    if (rainyFilter) pois = pois.filter(p => p.category === 'Culture');
    if (freeOnly) pois = pois.filter(p => p.isFree);
    if (dTicketMode && country === 'DE') pois = pois.filter(p => p.dTicket);
    pois = pois.filter(p => {
      const price = isicActive && p.hasISIC ? p.price * 0.5 : p.price;
      return price <= budget;
    });
    if (tripInterests.length > 0) {
      const categoryMap: Record<string, string> = { Culture: 'culture', Nature: 'nature' };
      pois = pois.filter(p => tripInterests.includes(categoryMap[p.category] || ''));
    }
    return pois;
  }, [selectedCity, rainyFilter, freeOnly, dTicketMode, country, budget, isicActive, tripInterests]);

  const stats = useMemo(() => ({
    poiCount: filteredPois.length,
    cost: Math.round(getEstimatedCost(filteredPois, isicActive)),
    steps: getTotalSteps(filteredPois),
    distance: getTotalDistance(filteredPois),
  }), [filteredPois, isicActive]);

  const generateTrip = useCallback(async () => {
    if (tripLoading) return;
    setTripLoading(true);
    setTripGenerated(false);
    setAiItinerary(null);
    setLoadingStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < LOADING_STEPS.length - 1) {
        setLoadingStep(step);
      }
    }, 700);

    try {
      const request = buildItineraryRequest(
        selectedCity.name,
        filteredPois,
        dayStartTime,
        dayEndTime,
        tripInterests,
        stepGoal,
      );
      const response = await generateItinerary(request);
      setAiItinerary(response.itinerary);
    } catch (err) {
      console.error('Failed to generate itinerary:', err);
      setAiItinerary(null);
    } finally {
      clearInterval(interval);
      setLoadingStep(LOADING_STEPS.length - 1);
      setTripLoading(false);
      setTripGenerated(true);
    }
  }, [tripLoading, selectedCity, filteredPois, dayStartTime, dayEndTime, tripInterests, stepGoal]);

  return (
    <PlannerContext.Provider value={{
      country, cityId, stepGoal, budget, dTicketMode, freeOnly, isicActive, rainyFilter, tripInterests, tripGenerated, tripLoading, loadingStep,
      dayStartTime, dayEndTime, dayStartMinutes, dayEndMinutes,
      aiItinerary,
      setCountry, setCityId, setStepGoal, setBudget, setDTicketMode, setFreeOnly, setIsicActive,
      setRainyFilter, toggleTripInterest, setTripGenerated, generateTrip,
      setDayStartTime, setDayEndTime,
      loadingSteps: LOADING_STEPS,
      cities, selectedCity, filteredPois, stats,
    }}>
      {children}
    </PlannerContext.Provider>
  );
}

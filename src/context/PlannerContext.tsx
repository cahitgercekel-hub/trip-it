import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { CITIES_DATA, City, POI, getVisitMinutes } from '@/data/cities';
import { buildItineraryRequest, generateItinerary } from '@/lib/api';
import { getTotalDistance, getTotalSteps, getEstimatedCost, optimizeRouteTSP } from '@/lib/planner';
import { Language, TRANSLATIONS, TranslationKey } from '@/lib/i18n';

function getStoredTime(key: string, fallback: string): string {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

function getStoredLang(): Language {
  try { return (localStorage.getItem('tageplan_lang') as Language) || 'en'; } catch { return 'en'; }
}

interface PlannerState {
  lang: Language;
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
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
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
  const [lang, setLangRaw] = useState<Language>(getStoredLang);
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

  const setLang = (l: Language) => {
    setLangRaw(l);
    try { localStorage.setItem('tageplan_lang', l); } catch (e) { console.warn('Failed to save language', e); }
  };

  const t = useCallback((key: TranslationKey) => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || key;
  }, [lang]);

  const setDayStartTime = (t: string) => {
    setDayStartTimeRaw(t);
    try { localStorage.setItem('tageplan_start_time', t); } catch (e) { console.warn('Failed to save start time', e); }
    // Auto-fix end time if needed
    if (timeToMinutes(t) >= timeToMinutes(dayEndTime)) {
      const fixed = timeToMinutes(t) + 60;
      const fixedStr = `${String(Math.floor(fixed / 60)).padStart(2, '0')}:${String(fixed % 60).padStart(2, '0')}`;
      setDayEndTimeRaw(fixedStr);
      try { localStorage.setItem('tageplan_end_time', fixedStr); } catch (e) { console.warn('Failed to save end time', e); }
    }
  };

  const setDayEndTime = (t: string) => {
    if (timeToMinutes(t) <= timeToMinutes(dayStartTime)) {
      const fixed = timeToMinutes(dayStartTime) + 60;
      const fixedStr = `${String(Math.floor(fixed / 60)).padStart(2, '0')}:${String(fixed % 60).padStart(2, '0')}`;
      setDayEndTimeRaw(fixedStr);
      try { localStorage.setItem('tageplan_end_time', fixedStr); } catch (e) { console.warn('Failed to save end time', e); }
    } else {
      setDayEndTimeRaw(t);
      try { localStorage.setItem('tageplan_end_time', t); } catch (e) { console.warn('Failed to save end time', e); }
    }
  };

  const dayStartMinutes = useMemo(() => timeToMinutes(dayStartTime), [dayStartTime]);
  const dayEndMinutes = useMemo(() => timeToMinutes(dayEndTime), [dayEndTime]);

  const toggleTripInterest = (id: string) => {
    setTripInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const cities = CITIES_DATA;
  const selectedCity = useMemo(() => CITIES_DATA.find(c => c.id === cityId) || CITIES_DATA[0], [cityId]);

  const filteredPois = useMemo(() => {
    let pois = selectedCity.pois;
    if (rainyFilter) pois = pois.filter(p => p.category === 'Culture');
    if (freeOnly) pois = pois.filter(p => p.isFree);
    if (dTicketMode) pois = pois.filter(p => p.dTicket);
    pois = pois.filter(p => {
      const price = isicActive && p.hasISIC ? p.price * 0.5 : p.price;
      return price <= budget;
    });
    if (tripInterests.length > 0) {
      const categoryMap: Record<string, string> = {
        'Culture': 'culture',
        'Nature': 'nature',
        'Food & Drink': 'food-drink',
        'Entertainment': 'entertainment',
        'Shopping': 'shopping',
        'History': 'history',
        'Nightlife': 'nightlife',
        'Relaxation': 'relaxation',
        'Family-Friendly': 'family',
        'Hidden Gems': 'hidden-gems'
      };
      pois = pois.filter(p => tripInterests.includes(categoryMap[p.category] || ''));
    }
    return optimizeRouteTSP(pois);
  }, [selectedCity, rainyFilter, freeOnly, dTicketMode, budget, isicActive, tripInterests]);

  const stats = useMemo(() => {
    // Calculate realistic days needed for the selected POIs
    let tripDays = 1;
    if (filteredPois.length > 0) {
      let currentMins = dayStartMinutes;
      filteredPois.forEach((poi) => {
        const visit = getVisitMinutes(poi);
        // Rough estimation: if POI + avg 20min transit overflows the day
        if (currentMins + visit + 20 > (tripDays * 1440 - (1440 - dayEndMinutes))) {
          tripDays++;
          currentMins = (tripDays - 1) * 1440 + dayStartMinutes;
        }
        currentMins += visit + 20;
      });
    }

    return {
      poiCount: filteredPois.length,
      cost: Math.round(getEstimatedCost(filteredPois, isicActive, dTicketMode, tripDays)),
      steps: getTotalSteps(filteredPois),
      distance: getTotalDistance(filteredPois),
    };
  }, [filteredPois, isicActive, dTicketMode, dayStartMinutes, dayEndMinutes]);

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
        lang,
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
  }, [tripLoading, selectedCity, filteredPois, dayStartTime, dayEndTime, tripInterests, stepGoal, lang]);

  return (
    <PlannerContext.Provider value={{
      lang, setLang, t,
      cityId, stepGoal, budget, dTicketMode, freeOnly, isicActive, rainyFilter, tripInterests, tripGenerated, tripLoading, loadingStep,
      dayStartTime, dayEndTime, dayStartMinutes, dayEndMinutes,
      aiItinerary,
      setCityId, setStepGoal, setBudget, setDTicketMode, setFreeOnly, setIsicActive,
      setRainyFilter, toggleTripInterest, setTripGenerated, generateTrip,
      setDayStartTime, setDayEndTime,
      loadingSteps: LOADING_STEPS,
      cities, selectedCity, filteredPois, stats,
    }}>
      {children}
    </PlannerContext.Provider>
  );
}

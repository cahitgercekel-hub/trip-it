import { useEffect, useState } from 'react';
import { PlannerProvider, usePlanner } from '@/context/PlannerContext';
import { PlannerSidebar } from '@/components/PlannerSidebar';
import { TimelinePanel } from '@/components/TimelinePanel';
import { MapPanel } from '@/components/MapPanel';
import { TripLoadingOverlay } from '@/components/TripLoadingOverlay';
import { useWeather } from '@/hooks/useWeather';
import { Menu, X, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function PlannerLayout() {
  const { selectedCity, country, setRainyFilter, tripGenerated } = usePlanner();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [itineraryExpanded, setItineraryExpanded] = useState(true);

  const { weather } = useWeather(selectedCity.center[0], selectedCity.center[1]);

  useEffect(() => {
    if (weather) {
      setRainyFilter(weather.isRainy);
    }
  }, [weather, setRainyFilter]);

  // Reset expanded state when a new trip is generated
  useEffect(() => {
    if (tripGenerated) setItineraryExpanded(true);
  }, [tripGenerated]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-14 min-h-[56px] flex items-center justify-between px-5 border-b border-border bg-card z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Trip It!</h1>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex w-[280px] shrink-0 h-full border-r border-border bg-card relative z-50">
          <div className="w-full h-full overflow-y-auto">
            <PlannerSidebar />
          </div>
        </div>

        {/* Itinerary panel — only after generation */}
        {tripGenerated && (
          <div className="hidden lg:flex relative shrink-0">
            {/* Panel with animated width */}
            <div
              className="h-full overflow-hidden transition-all duration-300 ease-in-out"
              style={{ width: itineraryExpanded ? 340 : 0 }}
            >
              <TimelinePanel />
            </div>

            {/* Middle toggle button */}
            <button
              onClick={() => setItineraryExpanded(prev => !prev)}
              className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 w-7 h-14 bg-card border border-border rounded-full flex items-center justify-center shadow-md hover:bg-secondary hover:border-primary/40 transition-all duration-200 cursor-pointer"
            >
              {itineraryExpanded ? (
                <ChevronLeft className="w-4 h-4 text-primary" />
              ) : (
                <ChevronRight className="w-4 h-4 text-primary" />
              )}
            </button>
          </div>
        )}

        <MapPanel />

        {/* Loading overlay */}
        <AnimatePresence>
          <TripLoadingOverlay />
        </AnimatePresence>

        {/* Mobile hamburger FAB */}
        <button
          className="lg:hidden fixed bottom-5 right-5 z-50 bg-primary rounded-full w-12 h-12 shadow-lg flex items-center justify-center text-primary-foreground"
          onClick={() => setMobileOpen(o => !o)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile overlay sidebar */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-40 bg-foreground/50"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="lg:hidden fixed inset-y-0 left-0 z-40 w-[280px] bg-card overflow-y-auto border-r border-border"
              >
                <PlannerSidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <PlannerProvider>
      <PlannerLayout />
    </PlannerProvider>
  );
};

export default Index;

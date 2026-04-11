import { useEffect, useState } from 'react';
import { PlannerProvider, usePlanner } from '@/context/PlannerContext';
import { PlannerSidebar } from '@/components/PlannerSidebar';
import { FloatingPanel } from '@/components/FloatingPanel';
import { TimelinePanel } from '@/components/TimelinePanel';
import { MapPanel } from '@/components/MapPanel';
import { useWeather } from '@/hooks/useWeather';
import { Menu, X, Globe } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function PlannerLayout() {
  const { selectedCity, country, setRainyFilter } = usePlanner();
  const [mobileOpen, setMobileOpen] = useState(false);
  const flag = country === 'DE' ? '🇩🇪' : '🇦🇹';

  const { weather } = useWeather(selectedCity.center[0], selectedCity.center[1]);

  useEffect(() => {
    if (weather) {
      setRainyFilter(weather.isRainy);
    }
  }, [weather, setRainyFilter]);

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
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            <span>{flag}</span>
            <span className="font-medium text-foreground">{selectedCity.name}</span>
            {weather && (
              <span className="flex items-center gap-1 ml-1 text-foreground">
                {weather.icon} {weather.temp}°C
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop: floating panel + full-width timeline & map */}
        <div className="hidden lg:block">
          <FloatingPanel>
            <PlannerSidebar />
          </FloatingPanel>
        </div>

        <TimelinePanel />
        <MapPanel />

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

const Index = () => (
  <PlannerProvider>
    <PlannerLayout />
  </PlannerProvider>
);

export default Index;

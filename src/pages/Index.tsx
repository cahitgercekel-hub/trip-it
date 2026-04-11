import { PlannerProvider, usePlanner } from '@/context/PlannerContext';
import { PlannerSidebar } from '@/components/PlannerSidebar';
import { TimelinePanel } from '@/components/TimelinePanel';
import { MapPanel } from '@/components/MapPanel';
import { useState } from 'react';
import { Menu, X, MapPin } from 'lucide-react';

function PlannerLayout() {
  const { selectedCity, country } = usePlanner();
  const [mobileOpen, setMobileOpen] = useState(false);
  const flag = country === 'DE' ? '🇩🇪' : '🇦🇹';

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-14 min-h-[56px] flex items-center justify-between px-5 border-b border-border bg-card z-50">
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Tageplan</h1>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            <span>{flag}</span>
            <span className="font-medium text-foreground">{selectedCity.name}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className={`
          ${mobileOpen ? 'absolute inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:relative lg:bg-transparent' : 'hidden lg:flex'}
        `}>
          <PlannerSidebar />
          {mobileOpen && (
            <div className="flex-1 lg:hidden" onClick={() => setMobileOpen(false)} />
          )}
        </div>

        <div className="hidden lg:flex">
          <TimelinePanel />
        </div>

        <MapPanel />
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

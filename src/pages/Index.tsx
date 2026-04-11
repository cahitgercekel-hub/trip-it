import { PlannerProvider, usePlanner } from '@/context/PlannerContext';
import { PlannerSidebar } from '@/components/PlannerSidebar';
import { TimelinePanel } from '@/components/TimelinePanel';
import { MapPanel } from '@/components/MapPanel';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

function PlannerLayout() {
  const { selectedCity, country } = usePlanner();
  const [mobileOpen, setMobileOpen] = useState(false);
  const flag = country === 'DE' ? '🇩🇪' : '🇦🇹';

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-12 min-h-[48px] flex items-center justify-between px-4 border-b border-foreground/10 bg-card/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <button className="lg:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="text-base font-bold text-foreground tracking-tight">Tageplan</h1>
          <span className="text-sm text-muted-foreground">{flag} {selectedCity.name}</span>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - desktop always visible, mobile overlay */}
        <div className={`
          ${mobileOpen ? 'absolute inset-0 z-40 bg-background/80 backdrop-blur-sm lg:relative lg:bg-transparent' : 'hidden lg:flex'}
        `}>
          <PlannerSidebar />
          {mobileOpen && (
            <div className="flex-1 lg:hidden" onClick={() => setMobileOpen(false)} />
          )}
        </div>

        {/* Timeline - hidden on mobile unless toggled */}
        <div className="hidden lg:flex">
          <TimelinePanel />
        </div>

        {/* Map */}
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

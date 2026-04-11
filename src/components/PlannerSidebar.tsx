import { usePlanner } from '@/context/PlannerContext';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Footprints, Train, Ticket, GraduationCap, Wallet, ArrowLeft,
} from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { HeadingToCard } from '@/components/sidebar/HeadingToCard';
import { DatesCard } from '@/components/sidebar/DatesCard';

import { WeatherPackingCard } from '@/components/sidebar/WeatherPackingCard';
import { CostEstimationCard } from '@/components/sidebar/CostEstimationCard';
import { TripInterestsCard } from '@/components/sidebar/TripInterestsCard';

const viewTransition = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 12 },
  transition: { duration: 0.25, ease: 'easeInOut' as const },
};

export function PlannerSidebar() {
  const {
    country, stepGoal, setStepGoal, budget, setBudget,
    dTicketMode, setDTicketMode, freeOnly, setFreeOnly,
    isicActive, setIsicActive, selectedCity,
    tripGenerated, setTripGenerated, tripLoading, generateTrip,
  } = usePlanner();

  

  const fadeProps = {
    animate: { opacity: 1 },
    transition: { duration: 0.15 },
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <TooltipProvider delayDuration={200}>
        <AnimatePresence mode="wait">
          {!tripGenerated ? (
            /* ─── Input View ─── */
            <motion.div key="input" {...viewTransition} className="flex flex-col gap-3">
              <HeadingToCard />
              <DatesCard />
              <TripInterestsCard />
              

              {/* Step Goal */}
              <SidebarCard title="Step Goal">
                <motion.div {...fadeProps}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Footprints className="w-3.5 h-3.5" />
                      <span className="text-xs">Daily target</span>
                    </div>
                    <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{stepGoal.toLocaleString()}</span>
                  </div>
                  <input type="range" min={3000} max={20000} step={500} value={stepGoal} onChange={e => setStepGoal(Number(e.target.value))} className="w-full sidebar-range" style={{ '--range-progress': `${((stepGoal - 3000) / (20000 - 3000)) * 100}%` } as React.CSSProperties} />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>3,000</span><span>20,000</span></div>
                </motion.div>
              </SidebarCard>

              {/* Budget */}
              <SidebarCard title="Max Budget per Attraction">
                <motion.div {...fadeProps}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Wallet className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Spend limit per spot</span>
                    </div>
                    <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">€{budget}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 mb-2">Max you'd pay for a single attraction — not the whole trip.</p>
                  <input type="range" min={0} max={300} step={5} value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full sidebar-range" style={{ '--range-progress': `${(budget / 300) * 100}%` } as React.CSSProperties} />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>€0</span><span>€300</span></div>
                </motion.div>
              </SidebarCard>

              {/* Filters */}
              <SidebarCard title="Filters">
                <motion.div {...fadeProps} className="flex flex-col gap-1">
                  <ToggleRow icon={<Train className="w-3.5 h-3.5" />} label="D-Ticket Mode" checked={dTicketMode} onChange={setDTicketMode} disabled={country === 'AT'} />
                  {country === 'AT' && <p className="text-[11px] text-warning pl-5 -mt-0.5 mb-1">D-Ticket is not valid in Austria 🇦🇹</p>}
                  <ToggleRow icon={<Ticket className="w-3.5 h-3.5" />} label="Free Only" checked={freeOnly} onChange={setFreeOnly} />
                  <ToggleRow icon={<GraduationCap className="w-3.5 h-3.5" />} label="ISIC Discounts" checked={isicActive} onChange={setIsicActive} />
                </motion.div>
              </SidebarCard>

              {/* Trip It! Button */}
              <button
                onClick={() => generateTrip()}
                disabled={tripLoading}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {tripLoading ? '⏳ Generating...' : '🚀 Trip It!'}
              </button>
            </motion.div>
          ) : (
            /* ─── Results View ─── */
            <motion.div key="results" {...viewTransition} className="flex flex-col gap-3">
              {/* Back button */}
              <button
                onClick={() => setTripGenerated(false)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Search</span>
              </button>


              {/* Packing */}
              <WeatherPackingCard />

              {/* Cost */}
              <CostEstimationCard />
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </div>
  );
}


/* ─── Shared sub-components ─── */
function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-card">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">{title}</label>
      {children}
    </div>
  );
}

function ToggleRow({ icon, label, checked, onChange, disabled }: {
  icon: React.ReactNode; label: string; checked: boolean; onChange: (b: boolean) => void; disabled?: boolean
}) {
  return (
    <label className={`flex items-center justify-between py-2 ${disabled ? 'opacity-40 pointer-events-none' : 'cursor-pointer'}`}>
      <span className="flex items-center gap-2 text-sm text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </span>
      <button
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`w-9 h-[22px] rounded-full transition-all relative ${checked ? 'bg-primary' : 'bg-border'}`}
      >
        <span className={`absolute top-[3px] w-4 h-4 rounded-full shadow-sm transition-transform ${checked ? 'left-[18px] bg-primary-foreground' : 'left-[3px] bg-card'}`} />
      </button>
    </label>
  );
}

import { usePlanner } from '@/context/PlannerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';

import { HeadingToCard } from '@/components/sidebar/HeadingToCard';
import { DatesCard } from '@/components/sidebar/DatesCard';
import { TripInterestsCard } from '@/components/sidebar/TripInterestsCard';
import { StepGoalCard } from '@/components/sidebar/StepGoalCard';
import { BudgetCard } from '@/components/sidebar/BudgetCard';
import { FiltersCard } from '@/components/sidebar/FiltersCard';
import { WeatherPackingCard } from '@/components/sidebar/WeatherPackingCard';
import { CostEstimationCard } from '@/components/sidebar/CostEstimationCard';

const viewTransition = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 12 },
  transition: { duration: 0.25, ease: 'easeInOut' as const },
};

export function PlannerSidebar() {
  const {
    tripGenerated, setTripGenerated, tripLoading, generateTrip, t
  } = usePlanner();

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
              <StepGoalCard />
              <BudgetCard />
              <FiltersCard />

              {/* Trip It! Button */}
              <button
                onClick={() => generateTrip()}
                disabled={tripLoading}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {tripLoading ? `⏳ ${t('preparing')}` : `🚀 ${t('tripIt')}`}
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
                <span>{t('backToSearch')}</span>
              </button>

              <WeatherPackingCard />
              <CostEstimationCard />
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </div>
  );
}

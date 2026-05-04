import { usePlanner } from '@/context/PlannerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Database, Landmark, Hotel, TrainFront, MapPin, CalendarCheck } from 'lucide-react';

const STEP_ICONS = [Search, Database, Landmark, Hotel, TrainFront, MapPin, CalendarCheck];

export function TripLoadingOverlay() {
  const { tripLoading, loadingStep, loadingSteps } = usePlanner();

  if (!tripLoading) return null;

  const progress = ((loadingStep + 1) / loadingSteps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-6 max-w-xs text-center">
        <div className="bg-white p-2 rounded-2xl shadow-xl">
          <img src="/logo_trip_it.png" alt="Trip It Logo" className="w-16 h-16" />
        </div>
        
        {/* Pulsing ring animation */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={loadingStep}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
              >
                {(() => {
                  const Icon = STEP_ICONS[loadingStep] || Search;
                  return <Icon className="w-7 h-7 text-primary" />;
                })()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Dynamic text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-sm font-medium text-foreground"
          >
            {loadingSteps[loadingStep]}
          </motion.p>
        </AnimatePresence>

        {/* Step counter */}
        <p className="text-[11px] text-muted-foreground">
          Step {loadingStep + 1} of {loadingSteps.length}
        </p>
      </div>
    </motion.div>
  );
}

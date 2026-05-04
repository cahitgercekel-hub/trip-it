import { usePlanner } from '@/context/PlannerContext';
import { motion } from 'framer-motion';
import { HeadingToCard } from './sidebar/HeadingToCard';
import { DatesCard } from './sidebar/DatesCard';
import { TripInterestsCard } from './sidebar/TripInterestsCard';
import { StepGoalCard } from './sidebar/StepGoalCard';
import { BudgetCard } from './sidebar/BudgetCard';
import { FiltersCard } from './sidebar/FiltersCard';
import { Sparkles } from 'lucide-react';
import { TutorialModal } from './TutorialModal';
import { cn } from '@/lib/utils';

export function LandingPage() {
  const { generateTrip, tripLoading, t, lang, setLang } = usePlanner();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=2000")',
          filter: 'blur(8px) brightness(0.6)',
          transform: 'scale(1.1)' // Prevents white edges from blur
        }}
      />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col items-center justify-start pt-16 md:pt-24 p-6 z-10 w-full max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex flex-col items-center text-center mb-14">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white p-2 rounded-2xl shadow-xl">
              <img src="/logo_trip_it.png" alt="Trip It Logo" className="w-16 h-16" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-extrabold text-white tracking-tighter flex items-center gap-2 drop-shadow-md">
                {t('title')} <TutorialModal />
              </h1>
              <p className="text-white/90 font-medium italic drop-shadow-sm">{t('subtitle')}</p>
            </div>
          </div>
        </header>

        {/* Form Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-8"
        >
          <div className="space-y-4">
            <HeadingToCard />
            <DatesCard />
          </div>
          <div className="space-y-4 lg:col-span-1">
            <TripInterestsCard />
            <FiltersCard />
          </div>
          <div className="space-y-4">
            <StepGoalCard />
            <BudgetCard />
          </div>
        </motion.div>

        {/* Action Button - Centered Bottom */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            animate={tripLoading ? {} : { 
              boxShadow: ["0 0 0px rgba(59, 130, 246, 0)", "0 0 25px rgba(59, 130, 246, 0.5)", "0 0 0px rgba(59, 130, 246, 0)"] 
            }}
            transition={{ 
              boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            onClick={() => generateTrip()}
            disabled={tripLoading}
            className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-black text-2xl tracking-tighter uppercase shadow-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {tripLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" />
              </span>
            ) : (
              t('tripIt')
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Language Toggle Pill - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-1 shadow-lg">
        <button 
          onClick={() => setLang('en')}
          className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
            lang === 'en' ? "bg-white text-primary" : "text-white/70 hover:text-white"
          )}
        >
          EN
        </button>
        <button 
          onClick={() => setLang('de')}
          className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
            lang === 'de' ? "bg-white text-primary" : "text-white/70 hover:text-white"
          )}
        >
          DE
        </button>
      </div>

      <footer className="w-full py-8 text-center text-white/60 text-xs z-10 mt-auto">
        <p>© 2026 Trip It! — AI-Optimized Local Guides for Germany's Top 15 Cities</p>
      </footer>
    </div>
  );
}

import { usePlanner } from '@/context/PlannerContext';
import { TRIP_CATEGORIES } from '@/data/categories';
import { Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TripInterestsCard() {
  const { tripInterests, toggleTripInterest } = usePlanner();

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-card">
      <div className="flex items-center gap-2 mb-2">
        <Compass className="w-4 h-4 text-primary" />
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Trip Interests
        </label>
      </div>
      <p className="text-[11px] text-muted-foreground mb-2.5 leading-relaxed">
        Select what kind of trip you want, and AI will prioritize matching places, food, and activities in your route.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {TRIP_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const active = tripInterests.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggleTripInterest(cat.id)}
              className={cn(
                'px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 border',
                active
                  ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                  : 'bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="w-3 h-3" />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

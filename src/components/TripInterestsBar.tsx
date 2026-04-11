import { usePlanner } from '@/context/PlannerContext';
import { TRIP_CATEGORIES } from '@/data/categories';
import { cn } from '@/lib/utils';

export function TripInterestsBar() {
  const { tripInterests, toggleTripInterest } = usePlanner();

  return (
    <div className="flex items-center gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-1.5 py-1 overflow-x-auto shadow-card scrollbar-hide">
      {TRIP_CATEGORIES.map(cat => {
        const Icon = cat.icon;
        const active = tripInterests.includes(cat.id);
        return (
          <button
            key={cat.id}
            onClick={() => toggleTripInterest(cat.id)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <Icon className="w-3 h-3" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

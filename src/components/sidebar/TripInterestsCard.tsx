import { usePlanner } from '@/context/PlannerContext';
import { TRIP_CATEGORIES } from '@/data/categories';
import { Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TranslationKey } from '@/lib/i18n';

export function TripInterestsCard() {
  const { tripInterests, toggleTripInterest, t } = usePlanner();

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-card">
      <div className="flex items-center gap-2 mb-2">
        <Compass className="w-4 h-4 text-primary" />
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          {t('tripInterests')}
        </label>
      </div>
      <p className="text-[11px] text-muted-foreground mb-2.5 leading-relaxed">
        {t('cat_desc')}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {TRIP_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const active = tripInterests.includes(cat.id);
          const translationKey = `cat_${cat.id.replace('-', '_')}` as TranslationKey;
          
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
              {t(translationKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

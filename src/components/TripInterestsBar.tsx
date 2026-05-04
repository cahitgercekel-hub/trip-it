import { usePlanner } from '@/context/PlannerContext';
import { TRIP_CATEGORIES } from '@/data/categories';
import { cn } from '@/lib/utils';
import { TranslationKey } from '@/lib/i18n';

const CATEGORY_COLORS: Record<string, string> = {
  culture: 'bg-[#6479f2]',
  nature: 'bg-[#1f9e60]',
  'food-drink': 'bg-[#f97316]',
  entertainment: 'bg-[#a855f7]',
  shopping: 'bg-[#ec4899]',
  history: 'bg-[#b45309]',
  nightlife: 'bg-[#4f46e5]',
  relaxation: 'bg-[#06b6d4]',
  family: 'bg-[#eab308]',
  'hidden-gems': 'bg-[#0d9488]',
};

export function TripInterestsBar() {
  const { tripInterests, toggleTripInterest, t } = usePlanner();

  return (
    <div className="flex items-center gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-1.5 py-1 overflow-x-auto shadow-card scrollbar-hide">
      {TRIP_CATEGORIES.map(cat => {
        const Icon = cat.icon;
        const active = tripInterests.includes(cat.id);
        const activeColor = CATEGORY_COLORS[cat.id] || 'bg-primary';
        const translationKey = `cat_${cat.id.replace('-', '_')}` as TranslationKey;
        
        return (
          <button
            key={cat.id}
            onClick={() => toggleTripInterest(cat.id)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5',
              active
                ? `${activeColor} text-white shadow-sm`
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <Icon className="w-3 h-3" />
            {t(translationKey)}
          </button>
        );
      })}
    </div>
  );
}

import { usePlanner } from '@/context/PlannerContext';
import { motion } from 'framer-motion';
import { Wallet, Sparkles, Home, Train, Utensils, Ticket, ShoppingBag } from 'lucide-react';
import { TranslationKey } from '@/lib/i18n';

interface CostCategory {
  label: string;
  key: TranslationKey;
  icon: React.ReactNode;
  amount: number;
  color: string; // tailwind bg class
}

export function CostEstimationCard() {
  const { stats, isicActive, selectedCity, t } = usePlanner();

  // Derive cost breakdown from attractions + estimates
  const attractionCost = stats.cost;
  const poiCount = stats.poiCount;

  // Estimated costs based on city/trip context
  const accommodationCost = Math.round(poiCount > 0 ? 45 + Math.random() * 20 : 0);
  const transportCost = Math.round(poiCount > 0 ? 9.5 + poiCount * 1.2 : 0);
  const foodCost = Math.round(poiCount > 0 ? 15 + poiCount * 3 : 0);
  const miscCost = Math.round(poiCount > 0 ? 5 + poiCount * 0.8 : 0);
  const totalCost = attractionCost + accommodationCost + transportCost + foodCost + miscCost;

  const categories: CostCategory[] = [
    { label: t('accommodation'), key: 'accommodation', icon: <Home className="w-3.5 h-3.5" />, amount: accommodationCost, color: 'bg-primary' },
    { label: t('transport'), key: 'transport', icon: <Train className="w-3.5 h-3.5" />, amount: transportCost, color: 'bg-nature' },
    { label: t('food'), key: 'food', icon: <Utensils className="w-3.5 h-3.5" />, amount: foodCost, color: 'bg-action' },
    { label: t('attractions'), key: 'attractions', icon: <Ticket className="w-3.5 h-3.5" />, amount: attractionCost, color: 'bg-culture' },
    { label: t('misc'), key: 'misc', icon: <ShoppingBag className="w-3.5 h-3.5" />, amount: miscCost, color: 'bg-muted-foreground' },
  ];

  const maxCategory = categories.reduce((a, b) => a.amount > b.amount ? a : b, categories[0]);

  // AI insight (Dynamic translation needed or simplified)
  const getInsight = () => {
    if (totalCost === 0) return t('noPoisMatch');
    if (attractionCost === 0) return `${selectedCity.name}: ${t('freeOnly')}`; // Simplified
    return `~€${totalCost}. ${isicActive ? t('savingMoney') : ''}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pt-3.5 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">💰</span>
            <span className="text-sm font-bold text-foreground">{t('costEstimation')}</span>
          </div>
          <span className="text-lg font-bold text-primary">€{totalCost}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">{t('estDailyBudget')}</p>
      </div>

      {/* Horizontal bar chart */}
      {totalCost > 0 && (
        <div className="mx-3 mb-3 rounded-lg overflow-hidden h-3 flex bg-secondary">
          {categories.map((cat, i) => {
            const pct = (cat.amount / totalCost) * 100;
            if (pct < 1) return null;
            return (
              <motion.div
                key={cat.key}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`${cat.color} h-full`}
                style={{ opacity: 0.8 + (i * 0.04) }}
                title={`${cat.label}: €${cat.amount} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>
      )}

      {/* Category breakdown */}
      <div className="px-4 pb-2 space-y-1.5">
        {categories.map(cat => (
          <div key={cat.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${cat.color}`} style={{ opacity: 0.85 }} />
              <span className="text-muted-foreground">{cat.icon}</span>
              <span className="text-[11px] text-foreground">{cat.label}</span>
            </div>
            <span className="text-[11px] font-semibold text-foreground">€{cat.amount}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border" />

      {/* AI Note */}
      <div className="px-4 py-3 flex gap-2">
        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed italic">
          {getInsight()}
        </p>
      </div>
    </motion.div>
  );
}

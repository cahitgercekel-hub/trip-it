import { usePlanner } from '@/context/PlannerContext';
import { Wallet } from 'lucide-react';

export function BudgetCard() {
  const { budget, setBudget, t } = usePlanner();

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 shadow-card">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5 block">{t('maxBudget')}</label>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Wallet className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{t('budgetLimit')}</span>
        </div>
        <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">€{budget}</span>
      </div>
      <p className="text-[10px] text-muted-foreground/70 mb-2.5 leading-relaxed">{t('budgetNote')}</p>
      <input 
        type="range" 
        min={0} 
        max={300} 
        step={5} 
        value={budget} 
        onChange={e => setBudget(Number(e.target.value))} 
        className="w-full sidebar-range" 
        style={{ '--range-progress': `${(budget / 300) * 100}%` } as React.CSSProperties} 
      />
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
        <span>€0</span>
        <span>€300</span>
      </div>
    </div>
  );
}

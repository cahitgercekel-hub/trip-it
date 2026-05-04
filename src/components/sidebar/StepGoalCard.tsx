import { usePlanner } from '@/context/PlannerContext';
import { Footprints } from 'lucide-react';

export function StepGoalCard() {
  const { stepGoal, setStepGoal, t } = usePlanner();

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 shadow-card">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5 block">{t('stepGoal')}</label>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Footprints className="w-3.5 h-3.5" />
          <span className="text-xs">{t('dailyTarget')}</span>
        </div>
        <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{stepGoal.toLocaleString()}</span>
      </div>
      <input 
        type="range" 
        min={3000} 
        max={20000} 
        step={500} 
        value={stepGoal} 
        onChange={e => setStepGoal(Number(e.target.value))} 
        className="w-full sidebar-range" 
        style={{ '--range-progress': `${((stepGoal - 3000) / (20000 - 3000)) * 100}%` } as React.CSSProperties} 
      />
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
        <span>3,000</span>
        <span>20,000</span>
      </div>
    </div>
  );
}

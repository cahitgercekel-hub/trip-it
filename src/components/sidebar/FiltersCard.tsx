import { usePlanner } from '@/context/PlannerContext';
import { Train, Ticket, GraduationCap } from 'lucide-react';

export function FiltersCard() {
  const { dTicketMode, setDTicketMode, freeOnly, setFreeOnly, isicActive, setIsicActive, t } = usePlanner();

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 shadow-card">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5 block">{t('filters')}</label>
      <div className="flex flex-col gap-1">
        <ToggleRow 
          icon={<Train className="w-3.5 h-3.5" />} 
          label={t('dTicketMode')} 
          checked={dTicketMode} 
          onChange={setDTicketMode} 
        />
        <ToggleRow 
          icon={<Ticket className="w-3.5 h-3.5" />} 
          label={t('freeOnly')} 
          checked={freeOnly} 
          onChange={setFreeOnly} 
        />
        <ToggleRow 
          icon={<GraduationCap className="w-3.5 h-3.5" />} 
          label={t('isicDiscounts')} 
          checked={isicActive} 
          onChange={setIsicActive} 
        />
      </div>
    </div>
  );
}

function ToggleRow({ icon, label, checked, onChange }: {
  icon: React.ReactNode; label: string; checked: boolean; onChange: (b: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <span className="flex items-center gap-2 text-sm text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-9 h-[22px] rounded-full transition-all relative ${checked ? 'bg-primary' : 'bg-border'}`}
      >
        <span className={`absolute top-[3px] w-4 h-4 rounded-full shadow-sm transition-transform ${checked ? 'left-[18px] bg-primary-foreground' : 'left-[3px] bg-card'}`} />
      </button>
    </label>
  );
}

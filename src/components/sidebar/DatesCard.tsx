import { useState, useMemo } from 'react';
import { Calendar, Minus, Plus, Check } from 'lucide-react';
import { format, addMonths, startOfMonth } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

export function DatesCard() {
  const [mode, setMode] = useState<'date' | 'flexible'>('date');
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>();
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [flexDays, setFlexDays] = useState<number | null>(null);
  const [flexMonth, setFlexMonth] = useState<number | null>(null);
  const [flexCount, setFlexCount] = useState(0); // 0 = "Flexible"

  const canConfirm = flexDays !== null || flexMonth !== null;

  // Build the month options starting from current month
  const monthOptions = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = addMonths(startOfMonth(now), i);
      return { index: d.getMonth(), label: MONTHS[d.getMonth()], year: d.getFullYear() };
    });
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 shadow-card">
      {/* Date / Flexible toggle */}
      <div className="flex items-center gap-1 bg-secondary rounded-full p-0.5 mb-3">
        <button
          onClick={() => setMode('date')}
          className={cn(
            'flex-1 py-1.5 rounded-full text-xs font-semibold transition-all text-center',
            mode === 'date'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Date
        </button>
        <button
          onClick={() => setMode('flexible')}
          className={cn(
            'flex-1 py-1.5 rounded-full text-xs font-semibold transition-all text-center',
            mode === 'flexible'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          I'm flexible
        </button>
      </div>

      {mode === 'date' ? (
        <div className="flex gap-2">
          <DateField label="Arrival Date" value={arrivalDate} onChange={setArrivalDate} />
          <DateField label="Departure Date" value={departureDate} onChange={setDepartureDate} minDate={arrivalDate} />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Days section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground">Days</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFlexCount(c => Math.max(0, c - 1))}
                  className="w-5 h-5 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <Minus className="w-3 h-3 text-muted-foreground" />
                </button>
                <span className="text-xs font-medium text-foreground min-w-[50px] text-center">
                  {flexCount === 0 ? 'Flexible' : `${flexCount} day${flexCount > 1 ? 's' : ''}`}
                </span>
                <button
                  onClick={() => setFlexCount(c => c + 1)}
                  className="w-5 h-5 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <Plus className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {DAY_OPTIONS.map(d => (
                <OptionPill
                  key={d}
                  label={`${d} day${d > 1 ? 's' : ''}`}
                  selected={flexDays === d}
                  onClick={() => setFlexDays(flexDays === d ? null : d)}
                />
              ))}
            </div>
          </div>

          {/* Month section */}
          <div>
            <span className="text-xs font-bold text-foreground mb-2 block">Month</span>
            <div className="grid grid-cols-4 gap-1.5">
              {monthOptions.map(m => (
                <OptionPill
                  key={`${m.year}-${m.index}`}
                  label={m.label}
                  selected={flexMonth === m.index}
                  onClick={() => setFlexMonth(flexMonth === m.index ? null : m.index)}
                />
              ))}
            </div>
          </div>

          {/* Confirm */}
          <div className="flex justify-end pt-1">
            <button
              disabled={!canConfirm}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all',
                canConfirm
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              <Check className="w-3 h-3" />
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function DateField({
  label, value, onChange, minDate,
}: {
  label: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  minDate?: Date;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex-1 flex flex-col gap-1 border border-border rounded-lg px-2.5 py-2 hover:bg-secondary/50 transition-colors text-left">
          <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
          <span className={cn('text-xs font-medium', value ? 'text-foreground' : 'text-muted-foreground italic')}>
            {value ? format(value, 'MMM d, yyyy') : 'Select'}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarPicker
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={minDate ? (date) => date < minDate : undefined}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

function OptionPill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'py-1.5 rounded-lg text-[11px] font-medium border transition-all',
        selected
          ? 'bg-primary/10 border-primary text-primary'
          : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
      )}
    >
      {label}
    </button>
  );
}

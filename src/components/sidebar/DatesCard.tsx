import { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { format, addDays, differenceInMinutes } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { usePlanner } from '@/context/PlannerContext';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Language, TRANSLATIONS, TranslationKey } from '@/lib/i18n';

function TimeColumn({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const items = Array.from({ length: max }, (_, i) => i);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      const child = el.querySelector(`[data-value="${value}"]`) as HTMLElement;
      if (child) child.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [value]);

  return (
    <ScrollArea className="h-[160px] w-14" ref={ref}>
      <div className="flex flex-col items-center py-2">
        {items.map(i => (
          <button
            key={i}
            data-value={i}
            onClick={() => onChange(i)}
            className={cn(
              'w-10 h-8 rounded-md text-xs font-medium flex items-center justify-center transition-colors',
              i === value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary'
            )}
          >
            {String(i).padStart(2, '0')}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}

function TimePicker({ hours, minutes, onHoursChange, onMinutesChange, t }: {
  hours: number; minutes: number;
  onHoursChange: (h: number) => void;
  onMinutesChange: (m: number) => void;
  t: (k: TranslationKey) => string;
}) {
  return (
    <div className="border-l border-border px-3 py-3 flex flex-col justify-center">
      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2 text-center">{t('time')}</span>
      <div className="flex items-center justify-center gap-1">
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-muted-foreground mb-0.5">{t('hr')}</span>
          <TimeColumn value={hours} max={24} onChange={onHoursChange} />
        </div>
        <span className="text-lg font-bold text-muted-foreground mt-3">:</span>
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-muted-foreground mb-0.5">{t('min')}</span>
          <TimeColumn value={minutes} max={60} onChange={onMinutesChange} />
        </div>
      </div>
    </div>
  );
}

export function DatesCard() {
  const { dayStartTime, dayEndTime, setDayStartTime, setDayEndTime, t } = usePlanner();

  const [arrivalDate, setArrivalDate] = useState<Date | undefined>();
  const [arrivalHours, setArrivalHours] = useState(() => parseInt(dayStartTime.split(':')[0]));
  const [arrivalMinutes, setArrivalMinutes] = useState(() => parseInt(dayStartTime.split(':')[1]));

  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [departureHours, setDepartureHours] = useState(() => parseInt(dayEndTime.split(':')[0]));
  const [departureMinutes, setDepartureMinutes] = useState(() => parseInt(dayEndTime.split(':')[1]));

  // Sync time back to planner context
  useEffect(() => {
    const timeStr = `${String(arrivalHours).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;
    setDayStartTime(timeStr);
  }, [arrivalHours, arrivalMinutes, setDayStartTime]);

  useEffect(() => {
    const timeStr = `${String(departureHours).padStart(2, '0')}:${String(departureMinutes).padStart(2, '0')}`;
    setDayEndTime(timeStr);
  }, [departureHours, departureMinutes, setDayEndTime]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleArrivalDate = (d: Date | undefined) => {
    setArrivalDate(d);
    if (d && departureDate && departureDate > addDays(d, 1)) {
      setDepartureDate(undefined);
    }
  };

  const arrivalDateTime = useMemo(() => {
    if (!arrivalDate) return null;
    const d = new Date(arrivalDate);
    d.setHours(arrivalHours, arrivalMinutes, 0, 0);
    return d;
  }, [arrivalDate, arrivalHours, arrivalMinutes]);

  const departureDateTime = useMemo(() => {
    if (!departureDate) return null;
    const d = new Date(departureDate);
    d.setHours(departureHours, departureMinutes, 0, 0);
    return d;
  }, [departureDate, departureHours, departureMinutes]);

  const durationText = useMemo(() => {
    if (!arrivalDateTime || !departureDateTime) {
      const startMins = arrivalHours * 60 + arrivalMinutes;
      const endMins = departureHours * 60 + departureMinutes;
      const totalMins = Math.max(0, endMins - startMins);
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      let res = '';
      if (hrs > 0) res += `${hrs} ${t(hrs > 1 ? 'hr' : 'hr')}`; // Simplified for now
      if (mins > 0) res += ` ${mins} ${t('min')}`;
      return res || `0 ${t('hr')}`;
    }
    const mins = differenceInMinutes(departureDateTime, arrivalDateTime);
    const d = Math.floor(mins / 1440);
    const h = Math.floor((mins % 1440) / 60);
    const m = mins % 60;
    const parts: string[] = [];
    if (d > 0) parts.push(`${d} ${t(d > 1 ? 'days' : 'day')}`);
    if (h > 0) parts.push(`${h} ${t(h > 1 ? 'hr' : 'hr')}`); // Simplified
    if (m > 0 && d === 0) parts.push(`${m} ${t('min')}`);
    return parts.join(', ') || `0 ${t('hr')}`;
  }, [arrivalDateTime, departureDateTime, arrivalHours, arrivalMinutes, departureHours, departureMinutes, t]);

  const formatDisplay = (date: Date | undefined, hours: number, minutes: number) => {
    if (!date) return null;
    return `${format(date, 'MMM d, yyyy')} - ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 shadow-card">
      <div className="flex items-center gap-2 mb-2.5">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-foreground">{t('datesSchedule')}</span>
      </div>

      <div className="flex flex-col gap-2">
        {/* Arrival */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full flex flex-col gap-1 border border-border rounded-lg px-2.5 py-2 hover:bg-secondary/50 transition-colors text-left">
              <span className="text-[10px] text-muted-foreground font-medium">{t('arrival')}</span>
              <span className={cn('text-xs font-medium', arrivalDate ? 'text-foreground' : 'text-muted-foreground italic')}>
                {formatDisplay(arrivalDate, arrivalHours, arrivalMinutes) ?? t('selectDateTime')}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[100] flex flex-row" align="start">
            <CalendarPicker
              mode="single"
              selected={arrivalDate}
              onSelect={handleArrivalDate}
              disabled={(date) => date < today}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
            <TimePicker
              hours={arrivalHours}
              minutes={arrivalMinutes}
              onHoursChange={setArrivalHours}
              onMinutesChange={setArrivalMinutes}
              t={t}
            />
          </PopoverContent>
        </Popover>

        {/* Departure */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full flex flex-col gap-1 border border-border rounded-lg px-2.5 py-2 hover:bg-secondary/50 transition-colors text-left">
              <span className="text-[10px] text-muted-foreground font-medium">{t('departure')}</span>
              <span className={cn('text-xs font-medium', departureDate ? 'text-foreground' : 'text-muted-foreground italic')}>
                {formatDisplay(departureDate, departureHours, departureMinutes) ?? t('selectDateTime')}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[100] flex flex-row" align="start" side="bottom" sideOffset={4} avoidCollisions collisionPadding={8}>
            <CalendarPicker
              mode="single"
              selected={departureDate}
              onSelect={setDepartureDate}
              disabled={(date) => {
                if (!arrivalDate) return date < today;
                return date < arrivalDate || date > addDays(arrivalDate, 1);
              }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
            <TimePicker
              hours={departureHours}
              minutes={departureMinutes}
              onHoursChange={setDepartureHours}
              onMinutesChange={setDepartureMinutes}
              t={t}
            />
          </PopoverContent>
        </Popover>
      </div>

      {arrivalDate && departureDate && (
        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
          {t('duration')}: {durationText}
        </p>
      )}
    </div>
  );
}

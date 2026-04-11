import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { usePlanner } from '@/context/PlannerContext';

export function DatesCard() {
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>();
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const { dayStartTime, dayEndTime, setDayStartTime, setDayEndTime } = usePlanner();

  const handleArrivalChange = (d: Date | undefined) => {
    setArrivalDate(d);
    if (d && departureDate && departureDate > addDays(d, 1)) {
      setDepartureDate(undefined);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startMins = toMinutes(dayStartTime);
  const endMins = toMinutes(dayEndTime);
  const durationHours = Math.max(0, (endMins - startMins) / 60);

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 shadow-card">
      <div className="flex items-center gap-2 mb-2.5">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-foreground">Dates & Schedule</span>
      </div>

      {/* Date pickers */}
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex-1 flex flex-col gap-1 border border-border rounded-lg px-2.5 py-2 hover:bg-secondary/50 transition-colors text-left">
              <span className="text-[10px] text-muted-foreground font-medium">Arrival Date</span>
              <span className={cn('text-xs font-medium', arrivalDate ? 'text-foreground' : 'text-muted-foreground italic')}>
                {arrivalDate ? format(arrivalDate, 'MMM d, yyyy') : 'Select'}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[100]" align="start">
            <CalendarPicker
              mode="single"
              selected={arrivalDate}
              onSelect={handleArrivalChange}
              disabled={(date) => date < today}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button className="flex-1 flex flex-col gap-1 border border-border rounded-lg px-2.5 py-2 hover:bg-secondary/50 transition-colors text-left">
              <span className="text-[10px] text-muted-foreground font-medium">Departure Date</span>
              <span className={cn('text-xs font-medium', departureDate ? 'text-foreground' : 'text-muted-foreground italic')}>
                {departureDate ? format(departureDate, 'MMM d, yyyy') : 'Select'}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[100]" align="start" side="bottom" sideOffset={4} avoidCollisions={true} collisionPadding={8}>
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
          </PopoverContent>
        </Popover>
      </div>

      <p className="text-[10px] text-muted-foreground mt-2 mb-3 leading-relaxed">
        Trips are currently limited to a maximum of 1 night.
      </p>

      {/* Day schedule - time pickers */}
      <div className="border-t border-border pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Day Schedule</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-medium">Arrival time</span>
            <input
              type="time"
              value={dayStartTime}
              onChange={e => setDayStartTime(e.target.value)}
              max={dayEndTime}
              className="w-full bg-secondary border border-border rounded-lg text-foreground text-xs px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors [color-scheme:dark]"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-medium">End time</span>
            <input
              type="time"
              value={dayEndTime}
              onChange={e => setDayEndTime(e.target.value)}
              min={dayStartTime}
              className="w-full bg-secondary border border-border rounded-lg text-foreground text-xs px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors [color-scheme:dark]"
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Duration: {durationHours % 1 === 0 ? `${durationHours} hours` : `${durationHours.toFixed(1)} hours`}
        </p>
      </div>
    </div>
  );
}

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

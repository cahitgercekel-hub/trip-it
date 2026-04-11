import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export function DatesCard() {
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>();
  const [departureDate, setDepartureDate] = useState<Date | undefined>();

  const handleArrivalChange = (d: Date | undefined) => {
    setArrivalDate(d);
    // Reset departure if it's now out of range
    if (d && departureDate && departureDate > addDays(d, 2)) {
      setDepartureDate(undefined);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDeparture = arrivalDate ? addDays(arrivalDate, 2) : undefined;

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 shadow-card">
      <div className="flex items-center gap-2 mb-2.5">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-foreground">Dates</span>
      </div>

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
          <PopoverContent className="w-auto p-0" align="start">
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
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarPicker
              mode="single"
              selected={departureDate}
              onSelect={setDepartureDate}
              disabled={(date) => {
                if (!arrivalDate) return date < today;
                return date < arrivalDate || date > addDays(arrivalDate, 2);
              }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
        Trips are currently limited to a maximum of 2 days.
      </p>
    </div>
  );
}

import { usePlanner } from '@/context/PlannerContext';
import { Clock } from 'lucide-react';

export function DayScheduleCard() {
  const { dayStartTime, dayEndTime, setDayStartTime, setDayEndTime } = usePlanner();

  const startMins = toMinutes(dayStartTime);
  const endMins = toMinutes(dayEndTime);
  const durationHours = Math.max(0, (endMins - startMins) / 60);
  const isInvalid = endMins <= startMins;

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-card">
      <div className="flex items-center gap-2 mb-2.5">
        <Clock className="w-4 h-4 text-primary" />
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Day Schedule
        </label>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-medium">Start time</span>
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

      {isInvalid ? (
        <p className="text-[10px] text-destructive mt-2 leading-relaxed">
          End time must be after start time
        </p>
      ) : (
        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
          Duration: {durationHours % 1 === 0 ? `${durationHours} hours` : `${durationHours.toFixed(1)} hours`}
        </p>
      )}
    </div>
  );
}

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

import { usePlanner } from '@/context/PlannerContext';
import { haversine } from '@/lib/planner';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, TreePine, Droplets, AlertTriangle } from 'lucide-react';

interface TimelineEntry {
  type: 'poi' | 'refill' | 'warning';
  poi?: typeof import('@/data/cities').CITIES_DATA[0]['pois'][0];
  time: string;
  distance?: number;
  steps?: number;
}

export function TimelinePanel() {
  const { filteredPois, stepGoal, dTicketMode, isicActive } = usePlanner();

  const gapCount = Math.max(filteredPois.length - 1, 1);
  const stepsPerGap = stepGoal / gapCount;

  const entries: TimelineEntry[] = [];
  let hour = 9;

  filteredPois.forEach((poi, i) => {
    entries.push({ type: 'poi', poi, time: `${String(hour).padStart(2, '0')}:00` });
    hour++;

    if (i < filteredPois.length - 1) {
      const next = filteredPois[i + 1];
      const dist = haversine(poi.lat, poi.lng, next.lat, next.lng);
      const steps = Math.round(dist * 1350);

      if (steps > stepsPerGap) {
        entries.push({
          type: 'warning',
          time: `${String(hour).padStart(2, '0')}:00`,
          distance: dist,
          steps,
        });
      } else {
        entries.push({ type: 'refill', time: `${String(hour).padStart(2, '0')}:00` });
      }
      hour++;
    }
  });

  return (
    <div className="w-[340px] min-w-[340px] h-screen overflow-y-auto bg-background border-r border-foreground/10 p-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Timeline</h2>
      <AnimatePresence mode="popLayout">
        {entries.map((entry, i) => (
          <motion.div
            key={`${entry.type}-${i}`}
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ delay: i * 0.03 }}
            className="flex gap-3 mb-0"
          >
            {/* Time + dot + line */}
            <div className="flex flex-col items-center w-14 shrink-0">
              <span className="text-xs text-muted-foreground font-mono">{entry.time}</span>
              <div className={`w-3 h-3 rounded-full mt-1 ${getDotColor(entry)}`} />
              {i < entries.length - 1 && <div className="w-px flex-1 bg-foreground/10 min-h-[24px]" />}
            </div>

            {/* Card */}
            <div className={`flex-1 mb-3 rounded-xl border border-foreground/10 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 ${getCardBorder(entry)}`}>
              {entry.type === 'poi' && entry.poi && (
                <div className="flex items-start gap-2">
                  {entry.poi.category === 'Culture' ? (
                    <Landmark className="w-4 h-4 text-indigo mt-0.5 shrink-0" />
                  ) : (
                    <TreePine className="w-4 h-4 text-emerald mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{entry.poi.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">{entry.poi.category}</span>
                      {entry.poi.isFree ? (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">Free</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          €{isicActive && entry.poi.hasISIC ? Math.round(entry.poi.price * 0.5) : entry.poi.price}
                        </span>
                      )}
                      {entry.poi.hasISIC && isicActive && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-indigo/20 text-indigo shadow-[0_0_8px_rgba(129,140,248,0.3)]">ISIC</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {entry.type === 'refill' && (
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky shrink-0" />
                  <p className="text-xs text-muted-foreground">💧 Refill your bottle here — fountain nearby</p>
                </div>
              )}
              {entry.type === 'warning' && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose shrink-0" />
                  <p className="text-xs text-rose">
                    🚇 {entry.distance?.toFixed(1)}km — Take the S-Bahn {dTicketMode ? '🎫' : ''}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {filteredPois.length === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-8">No POIs match your filters.</p>
      )}
    </div>
  );
}

function getDotColor(entry: TimelineEntry) {
  if (entry.type === 'refill') return 'bg-sky';
  if (entry.type === 'warning') return 'bg-rose';
  if (entry.poi?.category === 'Culture') return 'bg-indigo';
  return 'bg-emerald';
}

function getCardBorder(entry: TimelineEntry) {
  if (entry.type === 'refill') return 'border-l-2 border-l-sky';
  if (entry.type === 'warning') return 'border-l-2 border-l-rose';
  if (entry.poi?.category === 'Culture') return 'border-l-2 border-l-indigo';
  return 'border-l-2 border-l-emerald';
}

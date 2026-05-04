import { usePlanner } from '@/context/PlannerContext';
import { haversine, getTransportRecommendation, type TransportRecommendation } from '@/lib/planner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Landmark, TreePine, UtensilsCrossed, Music, ShoppingBag, 
  Castle, Moon, Leaf, SmilePlus, Sparkles, 
  TrainFront, Ticket, X, Footprints, Car, Info, Clock, Map as MapIcon, Calendar as CalendarIcon, Coffee
} from 'lucide-react';
import type { POI } from '@/data/cities';
import { getVisitMinutes } from '@/data/cities';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { LucideIcon } from 'lucide-react';
import { TranslationKey } from '@/lib/i18n';

interface TimelineEntry {
  type: 'poi' | 'transport' | 'day-break';
  poi?: POI;
  startTime: string;     // HH:MM
  endTime?: string;       // HH:MM (for POI entries)
  visitMinutes?: number;
  transport?: TransportRecommendation;
  dayNumber?: number;
}

function minutesToTime(totalMinutes: number): string {
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDuration(mins: number, t: (k: TranslationKey) => string): string {
  if (mins < 60) return `${mins} ${t('minLabel')}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h} ${t('hr')}`;
  return `${h} ${t('hr')} ${m} ${t('minLabel')}`;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Culture': Landmark,
  'Nature': TreePine,
  'Food & Drink': UtensilsCrossed,
  'Entertainment': Music,
  'Shopping': ShoppingBag,
  'History': Castle,
  'Nightlife': Moon,
  'Relaxation': Leaf,
  'Family-Friendly': SmilePlus,
  'Hidden Gems': Sparkles,
};

const CATEGORY_STYLES: Record<string, string> = {
  'Culture': 'bg-culture-light text-culture',
  'Nature': 'bg-nature-light text-nature',
  'Food & Drink': 'bg-orange-100 text-orange-600',
  'Entertainment': 'bg-purple-100 text-purple-600',
  'Shopping': 'bg-pink-100 text-pink-600',
  'History': 'bg-amber-100 text-amber-800',
  'Nightlife': 'bg-indigo-100 text-indigo-600',
  'Relaxation': 'bg-cyan-100 text-cyan-600',
  'Family-Friendly': 'bg-yellow-100 text-yellow-700',
  'Hidden Gems': 'bg-teal-100 text-teal-600',
};

export function TimelinePanel() {
  const { filteredPois, stepGoal, dTicketMode, isicActive, rainyFilter, setRainyFilter, selectedCity, aiItinerary, t } = usePlanner();
  const { dayStartMinutes, dayEndMinutes } = usePlanner();

  // Build duration-aware timeline with day breaks
  const entries: TimelineEntry[] = [];
  let currentMinutes = dayStartMinutes;
  let currentDay = 1;

  filteredPois.forEach((poi, i) => {
    const visit = getVisitMinutes(poi);
    
    // Check if adding this POI overflows the day
    if (currentMinutes + visit > (currentDay * 1440 - (1440 - dayEndMinutes))) {
      // Add day break
      entries.push({
        type: 'day-break',
        startTime: minutesToTime(currentMinutes),
        dayNumber: currentDay
      });
      currentDay++;
      currentMinutes = (currentDay - 1) * 1440 + dayStartMinutes;
    }

    const startTime = minutesToTime(currentMinutes);
    const endMinutes = currentMinutes + visit;
    const endTime = minutesToTime(endMinutes);

    entries.push({
      type: 'poi',
      poi,
      startTime,
      endTime,
      visitMinutes: visit,
    });

    currentMinutes = endMinutes;

    if (i < filteredPois.length - 1) {
      const next = filteredPois[i + 1];
      const dist = haversine(poi.lat, poi.lng, next.lat, next.lng);
      const transport = getTransportRecommendation(dist, stepGoal, dTicketMode);
      
      // If transport overflows the day, just push it to the next day
      if (currentMinutes + transport.totalMinutes > (currentDay * 1440 - (1440 - dayEndMinutes))) {
         entries.push({
          type: 'day-break',
          startTime: minutesToTime(currentMinutes),
          dayNumber: currentDay
        });
        currentDay++;
        currentMinutes = (currentDay - 1) * 1440 + dayStartMinutes;
      }

      const transitStart = minutesToTime(currentMinutes);
      entries.push({
        type: 'transport',
        startTime: transitStart,
        transport,
      });

      currentMinutes += transport.totalMinutes;
    }
  });

  const handleGoogleMaps = () => {
    if (filteredPois.length === 0) return;
    const origin = `${filteredPois[0].lat},${filteredPois[0].lng}`;
    const destination = filteredPois.length > 1 ? `${filteredPois[filteredPois.length-1].lat},${filteredPois[filteredPois.length-1].lng}` : origin;
    const waypoints = filteredPois.slice(1, -1).map(p => `${p.lat},${p.lng}`).join('|');
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=transit`;
    window.open(url, '_blank');
  };

  const handleCalendar = () => {
    toast.success(t('addToCalendar') + " - Data exported!");
  };

  const scheduleOverflow = filteredPois.length > 0 && currentMinutes > (currentDay * 1440 - (1440 - dayEndMinutes));
  const tooManyStops = filteredPois.length > 0 && ((dayEndMinutes - dayStartMinutes) / filteredPois.length) < 30;

  return (
    <div className="w-[340px] h-full overflow-y-auto p-5 bg-background border-r border-border">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">{t('yourItinerary')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filteredPois.length} {t('stops')} · {currentDay} {currentDay > 1 ? t('days') : t('day')}
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={handleCalendar} title={t('addToCalendar')}>
            <CalendarIcon className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={handleGoogleMaps} title={t('openInMaps')}>
            <MapIcon className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </Button>
        </div>
      </div>

      {tooManyStops && (
        <div className="mb-4 bg-amber-950/60 border border-amber-500/30 rounded-lg px-4 py-2 text-xs text-amber-300">
          {t('tooManyStops')}
        </div>
      )}

      {scheduleOverflow && !tooManyStops && (
        <div className="mb-4 bg-amber-950/60 border border-amber-500/30 rounded-lg px-4 py-2 text-xs text-amber-300">
          {t('itineraryPastEnd')}
        </div>
      )}

      {aiItinerary ? (
        <div className="prose prose-sm prose-invert max-w-none">
          <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap [&_strong]:font-bold [&_em]:italic">
            {aiItinerary.split('\n').map((line, i) => {
              const renderItalic = (text: string, keyPrefix: string) => {
                const parts = text.split(/\*(.+?)\*/g);
                return parts.map((part, idx) =>
                  idx % 2 === 1 ? <em key={`${keyPrefix}-i-${idx}`}>{part}</em> : part
                );
              };
              const segments = line.split(/\*\*(.+?)\*\*/g).map((seg, idx) =>
                idx % 2 === 1
                  ? <strong key={`b-${idx}`}>{renderItalic(seg, `b-${idx}`)}</strong>
                  : <span key={`t-${idx}`}>{renderItalic(seg, `t-${idx}`)}</span>
              );
              return (
                <p
                  key={i}
                  className={`mb-1 ${line.startsWith('*') ? 'pl-2 border-l-2 border-primary/30 ml-1' : ''}`}
                >
                  {line.length === 0 ? '\u00a0' : segments}
                </p>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-start gap-2 bg-secondary/50 border border-border/50 rounded-lg px-3 py-2">
            <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {t('timeEstimatedNote')}
            </p>
          </div>

          <AnimatePresence>
            {rainyFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="bg-danger-light border border-danger/20 rounded-lg px-4 py-2.5 flex items-start justify-between gap-2">
                  <p className="text-xs text-foreground leading-relaxed">
                    <span className="font-semibold">⛈️ {t('rainyNote')}</span>
                  </p>
                  <button
                    onClick={() => setRainyFilter(false)}
                    className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {entries.map((entry, i) => (
              <motion.div
                key={`${entry.type}-${i}`}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ delay: i * 0.03 }}
                className="flex gap-3"
              >
                {entry.type === 'day-break' ? (
                  <div className="w-full py-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-border" />
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border">
                      <Coffee className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('day')} {entry.dayNumber} {t('dayEnd')}</span>
                    </div>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center w-12 shrink-0">
                      <span className="text-[11px] text-muted-foreground font-mono font-medium">{entry.startTime}</span>
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ring-2 ring-offset-2 ring-offset-background ${getDotStyle(entry)}`} />
                      {i < entries.length - 1 && <div className="w-px flex-1 bg-border min-h-[20px]" />}
                    </div>
                    <div className={`flex-1 mb-3 rounded-lg border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${getCardStyle(entry)}`}>
                      {entry.type === 'poi' && entry.poi && (
                        <POICard
                          poi={entry.poi}
                          isicActive={isicActive}
                          visitMinutes={entry.visitMinutes!}
                          startTime={entry.startTime}
                          endTime={entry.endTime!}
                          t={t}
                        />
                      )}
                      {entry.type === 'transport' && entry.transport && <TransportCard transport={entry.transport} dTicketMode={dTicketMode} t={t} />}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredPois.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">{t('noPoisMatch')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('adjustFilters')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function POICard({ poi, isicActive, visitMinutes, startTime, endTime, t }: {
  poi: POI;
  isicActive: boolean;
  visitMinutes: number;
  startTime: string;
  endTime: string;
  t: (k: TranslationKey) => string;
}) {
  const Icon = CATEGORY_ICONS[poi.category] || Landmark;
  const style = CATEGORY_STYLES[poi.category] || 'bg-secondary text-foreground';
  const price = isicActive && poi.hasISIC ? Math.round(poi.price * 0.5) : poi.price;

  return (
    <div className="flex items-start gap-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight">{poi.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground font-mono">{startTime} – {endTime}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
            <Clock className="w-2.5 h-2.5" />
            {formatDuration(visitMinutes, t)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${style}`}>
            {poi.category}
          </span>
          {poi.isFree ? (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-nature-light text-nature">Free</span>
          ) : (
            <span className="text-[11px] font-medium text-muted-foreground">€{price}</span>
          )}
          {poi.hasISIC && isicActive && (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-culture-light text-culture">ISIC −50%</span>
          )}
          {poi.dTicket && (
            <Ticket className="w-3 h-3 text-primary" />
          )}
        </div>
      </div>
    </div>
  );
}

function TransportCard({ transport, dTicketMode, t }: { transport: TransportRecommendation; dTicketMode: boolean; t: (k: TranslationKey) => string }) {
  const { mode, distanceKm, totalMinutes, walkMinutes, rideMinutes, waitMinutes, transitType, label, walkingAdjusted, walkingTag } = transport;
  const ModeIcon = mode === 'walk' ? Footprints : mode === 'taxi' ? Car : TrainFront;
  const iconBg = mode === 'walk' ? 'bg-nature-light text-nature' : mode === 'taxi' ? 'bg-warning-light text-warning' : 'bg-primary/10 text-primary';
  
  const labelMap: Record<string, TranslationKey> = {
    'Walk to next stop': 'walkToNext',
    'Take Public Transit': 'takePublicTransit',
    'Take Taxi': 'takeTaxi',
  };
  const translatedLabel = t(labelMap[label] || (label as TranslationKey));

  const timeLabel = mode === 'walk' ? `${totalMinutes} ${t('minLabel')} walk` : `${totalMinutes} ${t('minLabel')} total`;
  const distLabel = distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`;
  const segments: { icon: LucideIcon; text: string; style: string }[] = [];
  if (mode === 'walk') {
    segments.push({ icon: Footprints, text: `${totalMinutes} ${t('minLabel')} walk`, style: 'bg-nature-light text-nature' });
  } else if (mode === 'transit') {
    if (walkMinutes > 0) segments.push({ icon: Footprints, text: `${walkMinutes} ${t('minLabel')} walk`, style: 'bg-nature-light text-nature' });
    if (waitMinutes > 0) segments.push({ icon: Clock, text: `${waitMinutes} ${t('minLabel')} wait`, style: 'bg-warning-light text-warning' });
    if (rideMinutes > 0) segments.push({ icon: TrainFront, text: `${rideMinutes} ${t('minLabel')} ${transitType}`, style: 'bg-primary/10 text-primary' });
  } else if (mode === 'taxi') {
    if (waitMinutes > 0) segments.push({ icon: Clock, text: `${waitMinutes} ${t('minLabel')} pickup`, style: 'bg-warning-light text-warning' });
    if (rideMinutes > 0) segments.push({ icon: Car, text: `${rideMinutes} ${t('minLabel')} taxi`, style: 'bg-secondary text-muted-foreground' });
  }
  return (
    <div className="flex items-start gap-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        <ModeIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">{translatedLabel}</p>
        <p className="text-[12px] font-bold text-foreground mt-0.5">{timeLabel} · {distLabel}</p>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {segments.map((seg, idx) => (
            <span key={idx} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md ${seg.style}`}>
              <seg.icon className="w-3 h-3" />
              {seg.text}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {dTicketMode && mode === 'transit' && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">D-Ticket ✓</span>
          )}
          {walkingAdjusted && walkingTag && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground italic">{walkingTag}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function getDotStyle(entry: TimelineEntry) {
  if (entry.type === 'transport') {
    if (entry.transport?.mode === 'walk') return 'bg-nature ring-nature/30';
    if (entry.transport?.mode === 'taxi') return 'bg-warning ring-warning/30';
    return 'bg-primary ring-primary/30';
  }
  const style = CATEGORY_STYLES[entry.poi?.category || ''] || 'bg-primary ring-primary/30';
  const parts = style.split(' ');
  const cls = parts[1];
  return cls ? cls.replace('text-', 'bg-') : 'bg-primary';
}

function getCardStyle(entry: TimelineEntry) {
  if (entry.type === 'transport') {
    if (entry.transport?.mode === 'walk') return 'bg-nature-light/50 border-nature/15';
    if (entry.transport?.mode === 'taxi') return 'bg-warning-light border-warning/20';
    return 'bg-primary/5 border-primary/15';
  }
  return 'bg-card border-border shadow-card';
}

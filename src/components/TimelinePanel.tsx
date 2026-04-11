import { usePlanner } from '@/context/PlannerContext';
import { haversine, getTransportRecommendation, type TransportRecommendation } from '@/lib/planner';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, TreePine, TrainFront, Ticket, X, Footprints, Car, Info, Clock } from 'lucide-react';
import type { POI } from '@/data/cities';
import { getVisitMinutes } from '@/data/cities';

interface TimelineEntry {
  type: 'poi' | 'transport';
  poi?: POI;
  startTime: string;     // HH:MM
  endTime?: string;       // HH:MM (for POI entries)
  visitMinutes?: number;
  transport?: TransportRecommendation;
}

function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function TimelinePanel() {
  const { filteredPois, stepGoal, dTicketMode, isicActive, rainyFilter, setRainyFilter, selectedCity } = usePlanner();

  // Build duration-aware timeline
  const entries: TimelineEntry[] = [];
  let currentMinutes = 9 * 60; // Start at 09:00

  filteredPois.forEach((poi, i) => {
    const visit = getVisitMinutes(poi);
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
      const transitStart = minutesToTime(currentMinutes);

      entries.push({
        type: 'transport',
        startTime: transitStart,
        transport,
      });

      currentMinutes += transport.totalMinutes;
    }
  });

  return (
    <div className="w-[340px] h-full overflow-y-auto p-5 bg-background border-r border-border">
      <div className="mb-5">
        <h2 className="text-base font-bold text-foreground">Your Itinerary</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {filteredPois.length} stops · {minutesToTime(9 * 60)} – {minutesToTime(currentMinutes)}
        </p>
      </div>

      <div className="mb-4 flex items-start gap-2 bg-secondary/50 border border-border/50 rounded-lg px-3 py-2">
        <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Times are estimated based on visit duration and travel time.
        </p>
      </div>

      {/* Rainy weather banner */}
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
                <span className="font-semibold">⛈️ Rainy weather detected in {selectedCity.name}</span>
                <br />
                <span className="text-muted-foreground">Showing indoor spots only.</span>
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
                />
              )}
              {entry.type === 'transport' && entry.transport && <TransportCard transport={entry.transport} dTicketMode={dTicketMode} />}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {filteredPois.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No POIs match your current filters.</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your budget or toggles.</p>
        </div>
      )}
    </div>
  );
}

/* ─── POI Card ─── */
function POICard({ poi, isicActive, visitMinutes, startTime, endTime }: {
  poi: POI;
  isicActive: boolean;
  visitMinutes: number;
  startTime: string;
  endTime: string;
}) {
  const isCulture = poi.category === 'Culture';
  const Icon = isCulture ? Landmark : TreePine;
  const price = isicActive && poi.hasISIC ? Math.round(poi.price * 0.5) : poi.price;

  return (
    <div className="flex items-start gap-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isCulture ? 'bg-culture-light text-culture' : 'bg-nature-light text-nature'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight">{poi.name}</p>

        {/* Time & duration row */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground font-mono">{startTime} – {endTime}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
            <Clock className="w-2.5 h-2.5" />
            {formatDuration(visitMinutes)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
            isCulture ? 'bg-culture-light text-culture' : 'bg-nature-light text-nature'
          }`}>
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

/* ─── Transport Card ─── */
function TransportCard({ transport, dTicketMode }: { transport: TransportRecommendation; dTicketMode: boolean }) {
  const { mode, distanceKm, totalMinutes, walkMinutes, rideMinutes, waitMinutes, transitType, label, walkingAdjusted, walkingTag } = transport;

  const ModeIcon = mode === 'walk' ? Footprints : mode === 'taxi' ? Car : TrainFront;
  const iconBg = mode === 'walk' ? 'bg-nature-light text-nature' : mode === 'taxi' ? 'bg-warning-light text-warning' : 'bg-primary/10 text-primary';

  const timeLabel = mode === 'walk'
    ? `${totalMinutes} min walk`
    : `${totalMinutes} min total`;

  const distLabel = distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`;

  const segments: { icon: React.ElementType; text: string; style: string }[] = [];

  if (mode === 'walk') {
    segments.push({ icon: Footprints, text: `${totalMinutes} min walk`, style: 'bg-nature-light text-nature' });
  } else if (mode === 'transit') {
    if (walkMinutes > 0) segments.push({ icon: Footprints, text: `${walkMinutes} min walk`, style: 'bg-nature-light text-nature' });
    if (waitMinutes > 0) segments.push({ icon: Clock, text: `${waitMinutes} min wait`, style: 'bg-warning-light text-warning' });
    if (rideMinutes > 0) segments.push({ icon: TrainFront, text: `${rideMinutes} min ${transitType}`, style: 'bg-primary/10 text-primary' });
  } else if (mode === 'taxi') {
    if (waitMinutes > 0) segments.push({ icon: Clock, text: `${waitMinutes} min pickup`, style: 'bg-warning-light text-warning' });
    if (rideMinutes > 0) segments.push({ icon: Car, text: `${rideMinutes} min taxi`, style: 'bg-secondary text-muted-foreground' });
  }

  return (
    <div className="flex items-start gap-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        <ModeIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[12px] font-bold text-foreground mt-0.5">
          {timeLabel} · {distLabel}
        </p>
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
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground italic">
              {walkingTag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function getDotStyle(entry: TimelineEntry) {
  if (entry.type === 'transport') {
    if (entry.transport?.mode === 'walk') return 'bg-nature ring-nature/30';
    if (entry.transport?.mode === 'taxi') return 'bg-warning ring-warning/30';
    return 'bg-primary ring-primary/30';
  }
  if (entry.poi?.category === 'Culture') return 'bg-culture ring-culture/30';
  return 'bg-nature ring-nature/30';
}

function getCardStyle(entry: TimelineEntry) {
  if (entry.type === 'transport') {
    if (entry.transport?.mode === 'walk') return 'bg-nature-light/50 border-nature/15';
    if (entry.transport?.mode === 'taxi') return 'bg-warning-light border-warning/20';
    return 'bg-primary/5 border-primary/15';
  }
  return 'bg-card border-border shadow-card';
}

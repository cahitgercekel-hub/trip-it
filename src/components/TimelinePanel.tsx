import { usePlanner } from '@/context/PlannerContext';
import { haversine } from '@/lib/planner';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, TreePine, Droplets, TrainFront, Ticket, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { POI } from '@/data/cities';
import { useState, useEffect } from 'react';

const TIMELINE_KEY = 'tageplan_timeline_collapsed';

function getInitialTimelineCollapsed(): boolean {
  try { return localStorage.getItem(TIMELINE_KEY) === 'true'; } catch { return false; }
}

interface TimelineEntry {
  type: 'poi' | 'refill' | 'warning';
  poi?: POI;
  time: string;
  distance?: number;
  steps?: number;
}

export function TimelinePanel() {
  const { filteredPois, stepGoal, dTicketMode, isicActive, rainyFilter, setRainyFilter, selectedCity } = usePlanner();
  const [collapsed, setCollapsed] = useState(getInitialTimelineCollapsed);

  useEffect(() => {
    try { localStorage.setItem(TIMELINE_KEY, String(collapsed)); } catch {}
  }, [collapsed]);

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
        entries.push({ type: 'warning', time: `${String(hour).padStart(2, '0')}:00`, distance: dist, steps });
      } else {
        entries.push({ type: 'refill', time: `${String(hour).padStart(2, '0')}:00` });
      }
      hour++;
    }
  });

  return (
    <div className="relative flex">
      <motion.div
        animate={{ width: collapsed ? 0 : 340, opacity: collapsed ? 0 : 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="h-full overflow-hidden bg-background border-r border-border"
        style={{ minWidth: 0 }}
      >
        <div className="w-[340px] h-full overflow-y-auto p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Your Itinerary</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{filteredPois.length} stops · Starting at 09:00</p>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="bg-secondary border border-border rounded-md w-7 h-7 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4 text-foreground" />
            </button>
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
                {/* Time + dot + connector */}
                <div className="flex flex-col items-center w-12 shrink-0">
                  <span className="text-[11px] text-muted-foreground font-mono font-medium">{entry.time}</span>
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ring-2 ring-offset-2 ring-offset-background ${getDotStyle(entry)}`} />
                  {i < entries.length - 1 && <div className="w-px flex-1 bg-border min-h-[20px]" />}
                </div>

                {/* Card */}
                <div className={`flex-1 mb-3 rounded-lg border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${getCardStyle(entry)}`}>
                  {entry.type === 'poi' && entry.poi && <POICard poi={entry.poi} isicActive={isicActive} />}
                  {entry.type === 'refill' && <RefillCard />}
                  {entry.type === 'warning' && <WarningCard distance={entry.distance!} dTicketMode={dTicketMode} />}
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
      </motion.div>

      {/* Collapsed vertical tab */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card border border-border rounded-r-md px-1.5 py-4 cursor-pointer hover:border-primary/40 transition-colors flex items-center"
        >
          <PanelLeftOpen className="w-3.5 h-3.5 text-muted-foreground mb-1" />
          <span
            className="text-[10px] text-muted-foreground font-medium tracking-wider"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            Itinerary
          </span>
        </button>
      )}
    </div>
  );
}

function POICard({ poi, isicActive }: { poi: POI; isicActive: boolean }) {
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

function RefillCard() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-info-light text-info">
        <Droplets className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">Water Refill</p>
        <p className="text-[11px] text-muted-foreground">Fountain nearby — refill your bottle</p>
      </div>
    </div>
  );
}

function WarningCard({ distance, dTicketMode }: { distance: number; dTicketMode: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-warning-light text-warning">
        <TrainFront className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">Take Public Transit</p>
        <p className="text-[11px] text-muted-foreground">
          {distance.toFixed(1)}km — S-Bahn recommended {dTicketMode && <span className="text-primary font-medium">· D-Ticket ✓</span>}
        </p>
      </div>
    </div>
  );
}

function getDotStyle(entry: TimelineEntry) {
  if (entry.type === 'refill') return 'bg-info ring-info/30';
  if (entry.type === 'warning') return 'bg-warning ring-warning/30';
  if (entry.poi?.category === 'Culture') return 'bg-culture ring-culture/30';
  return 'bg-nature ring-nature/30';
}

function getCardStyle(entry: TimelineEntry) {
  if (entry.type === 'refill') return 'bg-info-light border-info/20';
  if (entry.type === 'warning') return 'bg-warning-light border-warning/20';
  return 'bg-card border-border shadow-card';
}

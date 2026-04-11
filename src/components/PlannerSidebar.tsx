import { usePlanner } from '@/context/PlannerContext';
import { motion } from 'framer-motion';
import { MapPin, Euro, Footprints, Route } from 'lucide-react';

export function PlannerSidebar() {
  const {
    country, setCountry, cityId, setCityId, cities,
    stepGoal, setStepGoal, budget, setBudget,
    dTicketMode, setDTicketMode, freeOnly, setFreeOnly,
    isicActive, setIsicActive, planB, togglePlanB, stats,
  } = usePlanner();

  return (
    <aside className="w-[280px] min-w-[280px] h-screen overflow-y-auto bg-background border-r border-foreground/10 flex flex-col gap-3 p-4">
      {/* Country filter */}
      <Card>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Country</label>
        <div className="flex gap-2 mt-2">
          <PillButton active={country === 'DE'} onClick={() => setCountry('DE')}>🇩🇪 Germany</PillButton>
          <PillButton active={country === 'AT'} onClick={() => setCountry('AT')}>🇦🇹 Austria</PillButton>
        </div>
      </Card>

      {/* City select */}
      <Card>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">City</label>
        <select
          value={cityId}
          onChange={e => setCityId(e.target.value)}
          className="mt-2 w-full bg-surface-2 text-foreground border border-foreground/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {cities.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Card>

      {/* Step goal */}
      <Card>
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Step Goal</label>
          <span className="text-sm font-semibold text-primary">{stepGoal.toLocaleString()}</span>
        </div>
        <input
          type="range" min={3000} max={20000} step={500} value={stepGoal}
          onChange={e => setStepGoal(Number(e.target.value))}
          className="mt-2 w-full accent-primary"
        />
      </Card>

      {/* Budget */}
      <Card>
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Max Budget</label>
          <span className="text-sm font-semibold text-primary">€{budget}</span>
        </div>
        <input
          type="range" min={0} max={100} step={5} value={budget}
          onChange={e => setBudget(Number(e.target.value))}
          className="mt-2 w-full accent-primary"
        />
      </Card>

      {/* Toggles */}
      <Card>
        <ToggleRow
          label="D-Ticket Mode"
          checked={dTicketMode}
          onChange={setDTicketMode}
          disabled={country === 'AT'}
        />
        {country === 'AT' && (
          <p className="text-xs text-muted-foreground mt-1">D-Ticket is not valid in Austria 🇦🇹</p>
        )}
        <ToggleRow label="Free Only" checked={freeOnly} onChange={setFreeOnly} />
        <ToggleRow label="ISIC Discounts" checked={isicActive} onChange={setIsicActive} />
      </Card>

      {/* Plan B */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={togglePlanB}
        className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-rose-500 to-purple-500 text-foreground shadow-lg"
      >
        {planB ? '☀️ Back to Plan A' : '☁️ Plan B: Rainy Day'}
      </motion.button>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={<MapPin className="w-4 h-4" />} label="POIs" value={stats.poiCount.toString()} />
        <StatCard icon={<Euro className="w-4 h-4" />} label="Cost" value={`€${stats.cost}`} />
        <StatCard icon={<Footprints className="w-4 h-4" />} label="Steps" value={stats.steps.toLocaleString()} />
        <StatCard icon={<Route className="w-4 h-4" />} label="Distance" value={`${stats.distance.toFixed(1)}km`} />
      </div>
    </aside>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-foreground/10 rounded-xl p-3">
      {children}
    </div>
  );
}

function PillButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function ToggleRow({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (b: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex items-center justify-between py-1.5 ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-sm text-foreground">{label}</span>
      <button
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-surface-2'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </button>
    </label>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card border border-foreground/10 rounded-xl p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">{icon}<span className="text-xs">{label}</span></div>
      <span className="text-lg font-bold text-foreground">{value}</span>
    </div>
  );
}

import { usePlanner } from '@/context/PlannerContext';
import { motion } from 'framer-motion';
import { MapPin, Wallet, Footprints, Route, Train, Ticket, GraduationCap, Sparkles } from 'lucide-react';

export function PlannerSidebar() {
  const {
    country, setCountry, cityId, setCityId, cities,
    stepGoal, setStepGoal, budget, setBudget,
    dTicketMode, setDTicketMode, freeOnly, setFreeOnly,
    isicActive, setIsicActive, planB, togglePlanB, stats,
  } = usePlanner();

  return (
    <aside className="w-[280px] min-w-[280px] h-screen overflow-y-auto bg-card border-r border-border flex flex-col gap-3 p-4">
      {/* Country filter */}
      <SidebarCard title="Country">
        <div className="flex gap-2">
          <PillButton active={country === 'DE'} onClick={() => setCountry('DE')}>🇩🇪 Germany</PillButton>
          <PillButton active={country === 'AT'} onClick={() => setCountry('AT')}>🇦🇹 Austria</PillButton>
        </div>
      </SidebarCard>

      {/* City select */}
      <SidebarCard title="Destination">
        <select
          value={cityId}
          onChange={e => setCityId(e.target.value)}
          className="w-full bg-background text-foreground border border-border rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        >
          {cities.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </SidebarCard>

      {/* Step goal */}
      <SidebarCard title="Step Goal">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Footprints className="w-3.5 h-3.5" />
            <span className="text-xs">Daily target</span>
          </div>
          <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{stepGoal.toLocaleString()}</span>
        </div>
        <input
          type="range" min={3000} max={20000} step={500} value={stepGoal}
          onChange={e => setStepGoal(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>3,000</span><span>20,000</span>
        </div>
      </SidebarCard>

      {/* Budget */}
      <SidebarCard title="Max Budget">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Wallet className="w-3.5 h-3.5" />
            <span className="text-xs">Per attraction</span>
          </div>
          <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">€{budget}</span>
        </div>
        <input
          type="range" min={0} max={100} step={5} value={budget}
          onChange={e => setBudget(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>€0</span><span>€100</span>
        </div>
      </SidebarCard>

      {/* Toggles */}
      <SidebarCard title="Filters">
        <div className="flex flex-col gap-1">
          <ToggleRow
            icon={<Train className="w-3.5 h-3.5" />}
            label="D-Ticket Mode"
            checked={dTicketMode}
            onChange={setDTicketMode}
            disabled={country === 'AT'}
          />
          {country === 'AT' && (
            <p className="text-[11px] text-warning pl-5 -mt-0.5 mb-1">D-Ticket is not valid in Austria 🇦🇹</p>
          )}
          <ToggleRow
            icon={<Ticket className="w-3.5 h-3.5" />}
            label="Free Only"
            checked={freeOnly}
            onChange={setFreeOnly}
          />
          <ToggleRow
            icon={<GraduationCap className="w-3.5 h-3.5" />}
            label="ISIC Discounts"
            checked={isicActive}
            onChange={setIsicActive}
          />
        </div>
      </SidebarCard>

      {/* Plan B */}
      <motion.button
        whileHover={{ scale: 1.015, y: -1 }}
        whileTap={{ scale: 0.985 }}
        onClick={togglePlanB}
        className={`w-full py-3 rounded-lg font-semibold text-sm shadow-card transition-all flex items-center justify-center gap-2 ${
          planB
            ? 'bg-action text-action-foreground'
            : 'bg-primary text-primary-foreground'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        {planB ? '☀️ Back to Plan A' : '☁️ Plan B: Rainy Day'}
      </motion.button>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={<MapPin className="w-4 h-4 text-primary" />} label="POIs" value={stats.poiCount.toString()} />
        <StatCard icon={<Wallet className="w-4 h-4 text-action" />} label="Cost" value={`€${stats.cost}`} />
        <StatCard icon={<Footprints className="w-4 h-4 text-nature" />} label="Steps" value={stats.steps.toLocaleString()} />
        <StatCard icon={<Route className="w-4 h-4 text-culture" />} label="Distance" value={`${stats.distance.toFixed(1)}km`} />
      </div>
    </aside>
  );
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-card">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">{title}</label>
      {children}
    </div>
  );
}

function PillButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all shadow-pill ${
        active
          ? 'bg-primary text-primary-foreground shadow-card-hover'
          : 'bg-background text-muted-foreground hover:text-foreground hover:bg-secondary'
      }`}
    >
      {children}
    </button>
  );
}

function ToggleRow({ icon, label, checked, onChange, disabled }: {
  icon: React.ReactNode; label: string; checked: boolean; onChange: (b: boolean) => void; disabled?: boolean
}) {
  return (
    <label className={`flex items-center justify-between py-2 ${disabled ? 'opacity-40 pointer-events-none' : 'cursor-pointer'}`}>
      <span className="flex items-center gap-2 text-sm text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </span>
      <button
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`w-9 h-[22px] rounded-full transition-all relative ${
          checked ? 'bg-primary' : 'bg-border'
        }`}
      >
        <span className={`absolute top-[3px] w-4 h-4 rounded-full shadow-sm transition-transform ${
          checked ? 'left-[18px] bg-primary-foreground' : 'left-[3px] bg-card'
        }`} />
      </button>
    </label>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-card flex flex-col gap-1">
      <div className="flex items-center gap-1.5">{icon}<span className="text-[11px] text-muted-foreground font-medium">{label}</span></div>
      <span className="text-lg font-bold text-foreground">{value}</span>
    </div>
  );
}

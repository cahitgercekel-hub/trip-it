import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usePlanner } from '@/context/PlannerContext';

function MapController() {
  const { selectedCity } = usePlanner();
  const map = useMap();

  useEffect(() => {
    map.flyTo(selectedCity.center, selectedCity.zoom, { animate: true, duration: 1.2 });
  }, [selectedCity, map]);

  return null;
}

function createMarkerIcon(category: 'Culture' | 'Nature') {
  const emoji = category === 'Culture' ? '🏛️' : '🌿';
  const cls = category === 'Culture' ? 'marker-culture' : 'marker-nature';
  return L.divIcon({
    className: '',
    html: `<div class="custom-marker ${cls}">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function MapPanel() {
  const { selectedCity, filteredPois, mapFilter, setMapFilter, isicActive, country, cityId, setCityId, cities } = usePlanner();

  return (
    <div className="flex-1 h-screen relative">
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between">
        {/* City tabs */}
        <div className="flex items-center gap-1 bg-card/80 backdrop-blur-md border border-foreground/10 rounded-xl px-2 py-1 overflow-x-auto max-w-[60%]">
          {cities.map(c => (
            <button
              key={c.id}
              onClick={() => setCityId(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                c.id === cityId ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex gap-1 bg-card/80 backdrop-blur-md border border-foreground/10 rounded-xl px-2 py-1">
          {(['All', 'Culture', 'Nature'] as const).map(f => (
            <button
              key={f}
              onClick={() => setMapFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mapFilter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-4 z-[1000] bg-card/60 backdrop-blur-md border border-foreground/10 rounded-xl p-3">
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo" />
            <span className="text-muted-foreground">Culture</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald" />
            <span className="text-muted-foreground">Nature</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={selectedCity.center}
        zoom={selectedCity.zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <MapController />
        {filteredPois.map(poi => (
          <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={createMarkerIcon(poi.category)}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{poi.name}</p>
                <p className="text-xs mt-1">{poi.category}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {poi.isFree ? (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald/20 text-emerald">Free</span>
                  ) : (
                    <span className="text-xs">€{isicActive && poi.hasISIC ? Math.round(poi.price * 0.5) : poi.price}</span>
                  )}
                  {poi.hasISIC && <span className="text-xs px-1.5 py-0.5 rounded bg-indigo/20 text-indigo">ISIC</span>}
                  {poi.dTicket && <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">D-Ticket</span>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

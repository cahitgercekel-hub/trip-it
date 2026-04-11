import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usePlanner } from '@/context/PlannerContext';
import { Ticket } from 'lucide-react';
import { TripInterestsBar } from '@/components/TripInterestsBar';

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
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export function MapPanel() {
  const { selectedCity, filteredPois, isicActive } = usePlanner();

  return (
    <div className="flex-1 h-screen relative">
      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2">
        {/* Trip interests bar */}
        <TripInterestsBar />
      </div>


      <MapContainer
        center={selectedCity.center}
        zoom={selectedCity.zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <MapController />
        {filteredPois.map(poi => (
          <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={createMarkerIcon(poi.category)}>
            <Popup>
              <div className="text-sm min-w-[160px]">
                <p className="font-bold text-foreground">{poi.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{poi.category}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {poi.isFree ? (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-nature-light text-nature">Free</span>
                  ) : (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-foreground">
                      €{isicActive && poi.hasISIC ? Math.round(poi.price * 0.5) : poi.price}
                    </span>
                  )}
                  {poi.hasISIC && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-culture-light text-culture">ISIC</span>
                  )}
                  {poi.dTicket && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                      <Ticket className="w-3 h-3" /> D-Ticket
                    </span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

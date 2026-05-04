import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usePlanner } from '@/context/PlannerContext';
import { Ticket } from 'lucide-react';
import { TripInterestsBar } from '@/components/TripInterestsBar';
import { POICategory } from '@/data/cities';
import { TranslationKey } from '@/lib/i18n';

function MapController() {
  const { selectedCity, filteredPois, tripGenerated } = usePlanner();
  const map = useMap();

  useEffect(() => {
    if (tripGenerated && filteredPois.length >= 2) {
      const bounds = L.latLngBounds(filteredPois.map(p => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [60, 60], animate: true, duration: 1.2 });
    } else {
      map.flyTo(selectedCity.center, selectedCity.zoom, { animate: true, duration: 1.2 });
    }
  }, [selectedCity, filteredPois, tripGenerated, map]);

  return null;
}

const CATEGORY_ICONS: Record<POICategory, { emoji: string; cls: string }> = {
  'Culture': { emoji: '🏛️', cls: 'marker-culture' },
  'Nature': { emoji: '🌿', cls: 'marker-nature' },
  'Food & Drink': { emoji: '🍴', cls: 'marker-food-drink' },
  'Entertainment': { emoji: '🎭', cls: 'marker-entertainment' },
  'Shopping': { emoji: '🛍️', cls: 'marker-shopping' },
  'History': { emoji: '🏰', cls: 'marker-history' },
  'Nightlife': { emoji: '🌃', cls: 'marker-nightlife' },
  'Relaxation': { emoji: '🧘', cls: 'marker-relaxation' },
  'Family-Friendly': { emoji: '🎈', cls: 'marker-family' },
  'Hidden Gems': { emoji: '✨', cls: 'marker-hidden-gems' },
};

function createMarkerIcon(category: POICategory, index?: number) {
  const { emoji, cls } = CATEGORY_ICONS[category] || CATEGORY_ICONS['Culture'];
  const numberBadge = index != null
    ? `<span style="position:absolute;top:-6px;right:-6px;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-size:10px;font-weight:700;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid hsl(var(--background));">${index + 1}</span>`
    : '';
  return L.divIcon({
    className: '',
    html: `<div class="custom-marker ${cls}" style="position:relative;">${emoji}${numberBadge}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export function MapPanel() {
  const { selectedCity, filteredPois, isicActive, tripGenerated, t } = usePlanner();

  const routePositions = useMemo(() => {
    if (!tripGenerated || filteredPois.length < 2) return [];
    return filteredPois.map(p => [p.lat, p.lng] as [number, number]);
  }, [tripGenerated, filteredPois]);

  return (
    <div className="flex-1 h-screen relative z-10">
      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2">
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

        {/* Route polyline */}
        {routePositions.length >= 2 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: 'hsl(221, 83%, 53%)',
              weight: 4,
              opacity: 0.8,
              dashArray: '12, 8',
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {filteredPois.map((poi, idx) => (
          <Marker
            key={poi.id}
            position={[poi.lat, poi.lng]}
            icon={createMarkerIcon(poi.category, tripGenerated ? idx : undefined)}
          >
            <Popup>
              <div className="text-sm min-w-[160px]">
                <p className="font-bold text-foreground">{poi.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t(`cat_${poi.category.toLowerCase().replace(' & ', '_').replace(' ', '_').replace('-', '_')}` as TranslationKey)}
                </p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {poi.isFree ? (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-nature-light text-nature">{t('freeOnly')}</span>
                  ) : (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-foreground">
                      €{isicActive && poi.hasISIC ? Math.round(poi.price * 0.5) : poi.price}
                    </span>
                  )}
                  {poi.hasISIC && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-culture-light text-culture">{t('isicDiscounts')}</span>
                  )}
                  {poi.dTicket && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                      <Ticket className="w-3 h-3" /> {t('dTicketMode')}
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

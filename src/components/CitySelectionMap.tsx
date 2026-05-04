import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, Check } from "lucide-react";
import { Button } from "./ui/button";
import { usePlanner } from "@/context/PlannerContext";
import { CITIES_DATA } from "@/data/cities";
import { useEffect, useState } from "react";

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);
  return null;
}

export function CitySelectionMap() {
  const { cityId, setCityId, t } = usePlanner();
  const [open, setOpen] = useState(false);

  const handleSelect = (id: string) => {
    setCityId(id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          className="w-full bg-secondary/60 border-t border-border text-white hover:bg-secondary/80 gap-2 rounded-none rounded-b-xl h-11 transition-all"
        >
          <MapIcon className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-medium text-white">{t('chooseOnMap')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            {t('selectCityInGermany')}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 relative">
          <MapContainer 
            center={[51.1657, 10.4515]} 
            zoom={6} 
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapInvalidator />
            {CITIES_DATA.map(city => (
              <Marker 
                key={city.id} 
                position={city.center}
                eventHandlers={{
                  click: () => handleSelect(city.id)
                }}
              >
                <Popup>
                  <div className="text-center p-1">
                    <p className="font-bold text-sm mb-2">{city.name}</p>
                    <Button size="sm" onClick={() => handleSelect(city.id)} className="w-full h-8 text-xs">
                      {cityId === city.id ? (
                        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> {t('selected')}</span>
                      ) : t('selectCityBtn')}
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}

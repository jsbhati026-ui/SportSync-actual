import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Check, X, ExternalLink, Loader2 } from 'lucide-react';
import { reverseGeocodeCoords, findClosestIndianCity } from '../lib/geoNotifications';

export interface LocationResult {
  city: string;
  area: string;
  lat: number;
  lng: number;
}

interface MapLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity?: string;
  initialCity?: string;
  currentArea?: string;
  initialArea?: string;
  currentLat?: number;
  initialLat?: number;
  currentLng?: number;
  initialLng?: number;
  onSelectLocation: (location: LocationResult) => void;
}

export const MapLocationPickerModal: React.FC<MapLocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  initialCity,
  currentArea,
  initialArea,
  currentLat,
  initialLat,
  currentLng,
  initialLng,
  onSelectLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const effectiveCity = initialCity || currentCity || 'Chandigarh';
  const effectiveArea = initialArea || currentArea || (effectiveCity === 'Chandigarh' ? 'Sector 12' : 'Selected Area');
  const baseLat = initialLat ?? currentLat ?? (effectiveCity === 'Chandigarh' ? 30.7620 : 30.7333);
  const baseLng = initialLng ?? currentLng ?? (effectiveCity === 'Chandigarh' ? 76.7725 : 76.7794);

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: baseLat,
    lng: baseLng,
  });

  const [detectedArea, setDetectedArea] = useState<string>(effectiveArea);
  const [detectedCity, setDetectedCity] = useState<string>(effectiveCity);
  const [formattedAddress, setFormattedAddress] = useState<string>('');
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);

  // Sync coords whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const lat = initialLat ?? currentLat ?? (effectiveCity === 'Chandigarh' ? 30.7620 : 30.7333);
      const lng = initialLng ?? currentLng ?? (effectiveCity === 'Chandigarh' ? 76.7725 : 76.7794);
      setSelectedCoords({ lat, lng });
      resolveLocation(lat, lng);
    }
  }, [isOpen, currentCity, initialCity, currentLat, initialLat, currentLng, initialLng]);

  // Resolve location via reverse geocoding
  const resolveLocation = async (lat: number, lng: number) => {
    setIsResolving(true);
    try {
      const info = await reverseGeocodeCoords(lat, lng);
      setDetectedCity(info.city);
      setDetectedArea(info.area);
      setFormattedAddress(info.formattedAddress);
    } catch (e) {
      const fallback = findClosestIndianCity(lat, lng);
      setDetectedCity(fallback.city);
      setDetectedArea(fallback.area);
      setFormattedAddress(`${fallback.area}, ${fallback.city}`);
    } finally {
      setIsResolving(false);
    }
  };

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Dynamically load leaflet
    let isCancelled = false;

    import('leaflet').then((L) => {
      if (isCancelled || !mapContainerRef.current) return;

      // Fix default leaflet icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [selectedCoords.lat, selectedCoords.lng],
          zoom: 15,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="
              background: #2563eb;
              color: white;
              width: 38px;
              height: 38px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
              border: 3px solid white;
              cursor: grab;
            ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
        });

        const marker = L.marker([selectedCoords.lat, selectedCoords.lng], {
          draggable: true,
          icon: customIcon,
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setSelectedCoords({ lat: pos.lat, lng: pos.lng });
          resolveLocation(pos.lat, pos.lng);
        });

        // Click anywhere on map to move pin
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setSelectedCoords({ lat, lng });
          resolveLocation(lat, lng);
        });

        leafletMapRef.current = map;
        markerRef.current = marker;

        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      } else {
        leafletMapRef.current.setView([selectedCoords.lat, selectedCoords.lng], 15);
        if (markerRef.current) {
          markerRef.current.setLatLng([selectedCoords.lat, selectedCoords.lng]);
        }
        leafletMapRef.current.invalidateSize();
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  // Clean up leaflet on unmount
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const setLocationDirectly = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([lat, lng], 15, { animate: true });
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }
    resolveLocation(lat, lng);
  };

  // High-accuracy GPS location query
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingGPS(false);
        const { latitude, longitude } = position.coords;
        setLocationDirectly(latitude, longitude);
      },
      (error) => {
        setIsLocatingGPS(false);
        console.warn('GPS location error:', error.message);
        // If GPS permission denied or failed in iframe, fallback to Chandigarh Sector 12
        setLocationDirectly(30.7620, 76.7725);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Search places via Nominatim
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const query = encodeURIComponent(searchQuery.trim() + ', India');
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);
          setLocationDirectly(lat, lng);
        }
      }
    } catch (err) {
      console.warn('Search geocode error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    onSelectLocation({
      city: detectedCity,
      area: detectedArea,
      lat: selectedCoords.lat,
      lng: selectedCoords.lng,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Select Exact Match & Player Location
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click anywhere on the map or drag the pin to set your pinpoint coordinates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Action Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sector, neighborhood, or landmark (e.g., Sector 12 Chandigarh, PEC, Sarjapur)..."
                className="w-full pl-9 pr-24 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find'}
              </button>
            </form>

            <button
              type="button"
              onClick={handleUseGPS}
              disabled={isLocatingGPS}
              className="flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-60 shrink-0"
            >
              {isLocatingGPS ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span>Pin My GPS</span>
            </button>
          </div>

          {/* Quick Location Shortcuts */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-slate-400 shrink-0 font-medium mr-1">Quick Sectors:</span>
            {[
              { name: 'Sector 12, Chandigarh', lat: 30.7620, lng: 76.7725 },
              { name: 'Sector 17, Chandigarh', lat: 30.7398, lng: 76.7827 },
              { name: 'Sector 42, Chandigarh', lat: 30.7289, lng: 76.7495 },
              { name: 'Mohali Phase 7', lat: 30.7046, lng: 76.7179 },
              { name: 'Sarjapur Rd, BLR', lat: 12.9250, lng: 77.6840 },
              { name: 'Siri Fort, Delhi', lat: 28.5535, lng: 77.2212 },
              { name: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
            ].map((loc) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => setLocationDirectly(loc.lat, loc.lng)}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap transition"
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 min-h-[360px] bg-slate-100 dark:bg-slate-950">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

          {/* Pin drag hint badge */}
          <div className="absolute top-3 left-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>Click anywhere or drag the blue marker to select point</span>
          </div>

          {/* View on Google Maps Button */}
          <div className="absolute top-3 right-3 z-10">
            <a
              href={`https://www.google.com/maps?q=${selectedCoords.lat},${selectedCoords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition"
            >
              <span>View in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
            </a>
          </div>
        </div>

        {/* Bottom Selection Details & Save */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
                {detectedCity}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {detectedArea}
              </span>
              {isResolving && <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-md">
              {formattedAddress || `Latitude: ${selectedCoords.lat.toFixed(5)}, Longitude: ${selectedCoords.lng.toFixed(5)}`}
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition"
            >
              <Check className="w-4 h-4" />
              <span>Apply This Location</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

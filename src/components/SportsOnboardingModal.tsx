import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { SportType } from '../types';
import { SPORT_CATEGORIES, CITIES } from '../data/sportsData';
import { INDIAN_AREA_COORDS, getCoordinatesForArea, findClosestIndianCity, reverseGeocodeCoords } from '../lib/geoNotifications';
import { MapLocationPickerModal } from './MapLocationPickerModal';
import { Trophy, MapPin, Check, Navigation, AlertCircle, CheckCircle2, Sparkles, Map } from 'lucide-react';

interface SportsOnboardingModalProps {
  currentCity?: string;
  onCityChange?: (city: string) => void;
}

export const SportsOnboardingModal: React.FC<SportsOnboardingModalProps> = ({
  currentCity,
  onCityChange,
}) => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    userProfile,
    saveSportsInterests,
    updateCity,
    setIsProModalOpen,
  } = useAuth();

  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>(currentCity || 'Chandigarh');
  const [selectedArea, setSelectedArea] = useState<string>('Sector 12');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 30.7620, lng: 76.7725 });
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState<boolean>(false);

  // Popular quick-switch cities for fast convenience
  const POPULAR_CITIES = ['Chandigarh', 'Mohali', 'Panchkula', 'Bengaluru', 'Delhi NCR', 'Mumbai', 'Hyderabad'];

  const handleCitySelect = useCallback(
    (newCity: string, notifyParent: boolean = true) => {
      setSelectedCity(newCity);
      if (notifyParent && onCityChange) {
        onCityChange(newCity);
      }

      const availableAreas = Object.entries(INDIAN_AREA_COORDS)
        .filter(([_, data]) => data.city === newCity)
        .map(([areaName]) => areaName);

      const firstArea = availableAreas.length > 0 ? availableAreas[0] : newCity;
      setSelectedArea(firstArea);
      const resolvedCoords = getCoordinatesForArea(firstArea, newCity);
      setCoords(resolvedCoords);
      setGpsSuccess(null);
      setGpsError(null);

      // Sync immediately to auth context state
      updateCity(newCity, firstArea, resolvedCoords.lat, resolvedCoords.lng);
    },
    [onCityChange, updateCity]
  );

  // Initialize from existing profile or active city prop
  useEffect(() => {
    if (currentCity && currentCity !== selectedCity) {
      handleCitySelect(currentCity, false);
    }
  }, [currentCity, selectedCity, handleCitySelect]);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.favoriteSports && userProfile.favoriteSports.length > 0) {
        setSelectedSports(userProfile.favoriteSports.filter((s) => s !== 'all'));
      } else {
        setSelectedSports(['cricket', 'football']);
      }

      const activeCity = currentCity || userProfile.city || 'Bengaluru';
      setSelectedCity(activeCity);
      if (userProfile.area) setSelectedArea(userProfile.area);
      if (userProfile.lat && userProfile.lng) {
        setCoords({ lat: userProfile.lat, lng: userProfile.lng });
      } else {
        const defaultCoords = getCoordinatesForArea(userProfile.area || '', activeCity);
        setCoords(defaultCoords);
      }
    }
  }, [userProfile, currentCity]);

  if (!isOnboardingOpen) return null;

  const toggleSport = (sportId: SportType) => {
    if (sportId === 'all') return;
    setSelectedSports((prev) =>
      prev.includes(sportId) ? prev.filter((s) => s !== sportId) : [...prev, sportId]
    );
  };

  const fallbackNetworkLookup = async (
    resolve: (lat: number, lng: number, source: 'gps' | 'network') => void
  ) => {
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          resolve(Number(data.latitude), Number(data.longitude), 'network');
          return;
        }
      }
    } catch (e) {
      console.warn('Network location lookup fallback error:', e);
    }
    setIsDetectingGps(false);
    setGpsError('Could not auto-detect location. Please select your city or pick from the shortcuts below.');
  };

  const handleDetectGps = () => {
    setIsDetectingGps(true);
    setGpsError(null);
    setGpsSuccess(null);

    const applyDetectedLocation = async (detectedLat: number, detectedLng: number, source: 'gps' | 'network') => {
      try {
        const geoResult = await reverseGeocodeCoords(detectedLat, detectedLng);
        setCoords({ lat: detectedLat, lng: detectedLng });
        setSelectedCity(geoResult.city);
        setSelectedArea(geoResult.area);

        if (onCityChange) {
          onCityChange(geoResult.city);
        }
        updateCity(geoResult.city, geoResult.area, detectedLat, detectedLng);
        setGpsSuccess(
          `Auto-detected: ${geoResult.area}, ${geoResult.city} • ${detectedLat.toFixed(4)}° N, ${detectedLng.toFixed(4)}° E`
        );
      } catch {
        const closest = findClosestIndianCity(detectedLat, detectedLng);
        setCoords({ lat: detectedLat, lng: detectedLng });
        setSelectedCity(closest.city);
        setSelectedArea(closest.area);
        if (onCityChange) onCityChange(closest.city);
        updateCity(closest.city, closest.area, detectedLat, detectedLng);
      }
      setIsDetectingGps(false);
    };

    if (!navigator.geolocation) {
      fallbackNetworkLookup(applyDetectedLocation);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedLat = Number(position.coords.latitude.toFixed(4));
        const detectedLng = Number(position.coords.longitude.toFixed(4));
        applyDetectedLocation(detectedLat, detectedLng, 'gps');
      },
      (error) => {
        console.warn('Browser geolocation denied or timed out, trying network IP fallback:', error);
        fallbackNetworkLookup(applyDetectedLocation);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const handleAreaChange = (newArea: string) => {
    setSelectedArea(newArea);
    const resolved = getCoordinatesForArea(newArea, selectedCity);
    setCoords(resolved);
    updateCity(selectedCity, newArea, resolved.lat, resolved.lng);
  };

  const handleSave = async () => {
    if (selectedSports.length === 0) {
      alert('Please choose at least one sport you are interested in.');
      return;
    }

    setIsSaving(true);
    try {
      await saveSportsInterests(selectedSports, selectedArea, selectedCity, coords.lat, coords.lng);
      if (onCityChange) {
        onCityChange(selectedCity);
      }
      setTimeout(() => {
        setIsProModalOpen(true);
      }, 300);
    } catch (e) {
      console.error('Failed to save sports preferences:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Available areas filtered by selected city
  const areasForCity = Object.entries(INDIAN_AREA_COORDS)
    .filter(([_, data]) => data.city === selectedCity)
    .map(([areaName]) => areaName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col">
        {/* Header Banner */}
        <div className="bg-[#070B24] text-white px-6 py-6 relative overflow-hidden rounded-t-3xl">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-15 pointer-events-none">
            <Trophy className="w-48 h-48 text-blue-400" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black tracking-wider uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Step 1 of 1 • Player Preferences
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Which sports do you play?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
            SportSync will automatically send you an alert whenever a match in your favourite sport is hosted <span className="text-emerald-300 font-bold">within 10 km</span> of you!
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {/* Sports Selector Grid */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
              Select Your Favourite Sports <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SPORT_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                const isSelected = selectedSports.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleSport(cat.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white">{cat.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {cat.id === 'cricket' && 'Box cricket, nets & turfs'}
                          {cat.id === 'football' && '5v5 & 7v7 turf games'}
                          {cat.id === 'badminton' && 'Wooden & synthetic courts'}
                          {cat.id === 'basketball' && 'Full court runs & pickup'}
                          {cat.id === 'tennis' && 'Clay & hardcourt singles/doubles'}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'border-2 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & 5km Radius Configuration */}
          <div
            id="location-radius-config-box"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Your Location (5-10 km Match Radar)
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Radar
              </span>
            </div>

            {/* Quick City Shortcuts */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Quick Select Region:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CITIES.map((city) => {
                  const isActive = selectedCity.toLowerCase() === city.toLowerCase();
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  City / Region
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => handleCitySelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c} className="dark:bg-slate-900 dark:text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Neighborhood / Locality
                </label>
                {areasForCity.length > 0 ? (
                  <select
                    value={selectedArea}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    {areasForCity.map((area) => (
                      <option key={area} value={area} className="dark:bg-slate-900 dark:text-white">
                        {area}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={selectedArea}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    placeholder="e.g. Sector 17, Phase 7, Indiranagar"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                )}
              </div>
            </div>

            {/* GPS Auto-Detect & Interactive Map Picker Buttons */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={isDetectingGps}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-extrabold transition-colors cursor-pointer"
                >
                  <Navigation className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isDetectingGps ? 'animate-spin' : ''}`} />
                  <span>{isDetectingGps ? 'Detecting GPS...' : 'Auto-detect GPS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMapPickerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-extrabold transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Pick on Map (Any Location)</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
              </div>
            </div>

            {gpsSuccess && (
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold">{gpsSuccess}</span>
              </div>
            )}

            {gpsError && (
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-900">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 rounded-b-3xl">
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(false)}
            className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            I'll decide later
          </button>
          <button
            type="button"
            disabled={isSaving || selectedSports.length === 0}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Saving Preferences...' : 'Save Sports & Enable 10km Alerts'}
          </button>
        </div>
      </div>

      {/* Interactive Map Picker Modal */}
      {isMapPickerOpen && (
        <MapLocationPickerModal
          isOpen={isMapPickerOpen}
          onClose={() => setIsMapPickerOpen(false)}
          initialLat={coords.lat}
          initialLng={coords.lng}
          initialCity={selectedCity}
          initialArea={selectedArea}
          onSelectLocation={(selectedLoc) => {
            setCoords({ lat: selectedLoc.lat, lng: selectedLoc.lng });
            setSelectedCity(selectedLoc.city);
            setSelectedArea(selectedLoc.area);
            if (onCityChange) onCityChange(selectedLoc.city);
            updateCity(selectedLoc.city, selectedLoc.area, selectedLoc.lat, selectedLoc.lng);
            setGpsSuccess(`Selected on map: ${selectedLoc.area}, ${selectedLoc.city}`);
            setIsMapPickerOpen(false);
          }}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Venue, SportType } from '../types';
import { SportsEquipmentButton } from './SportsEquipmentButton';
import { Star, Check, Zap, MapPin, ChevronDown, ChevronUp, Share2, Clock, ShieldCheck, Sparkles, Navigation } from 'lucide-react';
import { isItemInLocation, TRICITY_CITIES } from '../lib/geoNotifications';

interface VenueBookingSectionProps {
  venues: Venue[];
  selectedSport: SportType;
  searchQuery: string;
  selectedDate: string;
  selectedCity: string;
  userCoords?: { lat: number; lng: number };
  onSelectVenue: (venue: Venue) => void;
}

export const VenueBookingSection: React.FC<VenueBookingSectionProps> = ({
  venues,
  selectedSport,
  searchQuery,
  selectedDate,
  selectedCity,
  userCoords,
  onSelectVenue,
}) => {
  const [filterIndoorOnly, setFilterIndoorOnly] = useState(false);
  const [expandedVenueIds, setExpandedVenueIds] = useState<Record<string, boolean>>({});
  const [copiedVenueId, setCopiedVenueId] = useState<string | null>(null);

  const toggleExpand = (venueId: string) => {
    setExpandedVenueIds((prev) => ({
      ...prev,
      [venueId]: !prev[venueId],
    }));
  };

  const handleCopyVenue = (e: React.MouseEvent, venue: Venue) => {
    e.stopPropagation();
    const summary = `🏟️ ${venue.name}\n📍 ${venue.area}, ${venue.city} (${venue.address})\n⭐ ${venue.rating} ★ (${venue.reviewCount} reviews)\n🏸 Sports: ${venue.sports.join(', ')}\n💰 From ₹${venue.startingPrice}/hr • ${venue.openHours}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
    }
    setCopiedVenueId(venue.id);
    setTimeout(() => setCopiedVenueId(null), 2200);
  };

  // Filter venues by selected location, sport, search, and criteria
  const filteredVenues = venues.filter((venue) => {
    // 1. Location match (city, metro or coords)
    const matchesLocation = isItemInLocation(
      { city: venue.city, area: venue.area },
      selectedCity,
      userCoords?.lat,
      userCoords?.lng,
      35
    );

    const matchesSport = selectedSport === 'all' || venue.sports.includes(selectedSport);
    const matchesQuery =
      searchQuery.trim() === '' ||
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndoor = !filterIndoorOnly || venue.courts.some((c) => c.isIndoor);

    return matchesLocation && matchesSport && matchesQuery && matchesIndoor;
  });

  const isTricity = TRICITY_CITIES.includes(selectedCity);

  return (
    <section className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-950 transition-colors" id="venues-catalog-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-black uppercase tracking-wider mb-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Instant Ground Booking
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0D1340] dark:text-white tracking-tight font-sans">
                Sports Turfs & Courts
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-black">
                <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                {selectedCity} {isTricity ? '(Tricity)' : ''} • {filteredVenues.length} Turfs
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5 max-w-xl font-medium">
              Showing verified tournament turfs, floodlit cricket nets, BWF synthetic mats, and courts in <strong className="text-slate-900 dark:text-slate-200">{selectedCity}</strong>. Click any card to expand full court specs and slots.
            </p>
          </div>

          {/* Clean Indoor filter toggle */}
          <div>
            <button
              onClick={() => setFilterIndoorOnly(!filterIndoorOnly)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                filterIndoorOnly
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🏢 Indoor / Covered Only
            </button>
          </div>
        </div>

        {/* Venues Grid */}
        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => {
              const isExpanded = Boolean(expandedVenueIds[venue.id]);
              const primarySportIcon = venue.sports.includes('cricket')
                ? 'cricket'
                : venue.sports.includes('football')
                ? 'football'
                : venue.sports.includes('badminton')
                ? 'badminton'
                : venue.sports.includes('basketball')
                ? 'basketball'
                : 'tennis';

              return (
                <div
                  key={venue.id}
                  onClick={() => toggleExpand(venue.id)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(venue.id);
                    }
                  }}
                  className={`group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col cursor-pointer text-left focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 ${
                    isExpanded
                      ? 'border-blue-500/80 dark:border-blue-500/80 shadow-xl ring-2 ring-blue-500/15'
                      : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg dark:hover:shadow-slate-900/60 hover:border-blue-300 dark:hover:border-blue-800'
                  }`}
                  id={`venue-card-${venue.id}`}
                >
                  {/* Photo & Badge */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-900">
                    <img
                      src={venue.coverImage}
                      alt={venue.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      {venue.badge && (
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                          {venue.badge}
                        </span>
                      )}
                      <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-extrabold">
                        {venue.distanceKm} km away
                      </span>
                    </div>

                    {/* Rating Tag */}
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-white/95 dark:bg-slate-900/90 backdrop-blur-xs text-[#0D1340] dark:text-white text-xs font-black flex items-center gap-1 shadow-xs z-10">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{venue.rating}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">({venue.reviewCount})</span>
                    </div>

                    {/* Expand/Collapse Toggle Button in Corner */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(venue.id);
                      }}
                      className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title={isExpanded ? 'Collapse Details' : 'Expand Details'}
                    >
                      <span>{isExpanded ? 'Collapse' : 'Details'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </button>

                    {/* Bottom Overlay Info */}
                    <div className="absolute bottom-3 left-3 right-24 text-white">
                      <div className="text-[10px] font-black uppercase tracking-wider text-blue-300 flex items-center gap-1">
                        {venue.area} • {venue.openHours}
                      </div>
                      <h3 className="text-base sm:text-lg font-black leading-snug line-clamp-1 text-white mt-0.5">
                        {venue.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Sports Available Chips */}
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {venue.sports.map((sp) => (
                          <span
                            key={sp}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-black uppercase tracking-wider"
                          >
                            {sp}
                          </span>
                        ))}
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold">
                          {venue.courts.length} Courts/Nets
                        </span>
                      </div>

                      {/* Key Amenities Preview */}
                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-3">
                        {venue.amenities.slice(0, 3).map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span className="truncate">{amenity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Fast Slot Availability Preview */}
                      <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center justify-between">
                          <span>Slots for {selectedDate}</span>
                          <span className="text-blue-600 dark:text-blue-400 font-extrabold">{venue.availableSlotsCount} Open</span>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                          {['06:00 PM', '07:30 PM', '09:00 PM'].map((slot, i) => (
                            <div
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-[11px] font-bold text-blue-900 dark:text-blue-300 shrink-0"
                            >
                              {slot}
                            </div>
                          ))}
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pl-1">+more</span>
                        </div>
                      </div>
                    </div>

                    {/* EXPANDABLE SECTION: Full Court Specs, All Amenities & Detailed Actions */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                        {/* Courts Breakdown */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              Available Courts & Pitches ({venue.courts.length})
                            </h4>
                            <span className="text-[10px] font-bold text-slate-400">Surface / Pricing</span>
                          </div>
                          <div className="space-y-2">
                            {venue.courts.map((court) => (
                              <div
                                key={court.id}
                                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                                    {court.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{court.surface}</span>
                                    <span>•</span>
                                    <span className={court.isIndoor ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                                      {court.isIndoor ? 'Indoor Covered' : 'Outdoor Turf'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-xs font-black text-[#0D1340] dark:text-white">
                                    ₹{court.basePrice}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block">/hr</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Full Amenities Checklist */}
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Facility Amenities & Features
                          </h4>
                          <div className="grid grid-cols-2 gap-1.5">
                            {venue.amenities.map((amenity, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 text-[11px] font-semibold"
                              >
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="truncate">{amenity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Full Address & Landmark */}
                        <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 mb-1">
                            <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>Address & Ground Location</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            {venue.address}
                          </p>
                          <div className="mt-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Operating Hours: {venue.openHours}</span>
                          </div>
                        </div>

                        {/* Share and Minimize Controls */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={(e) => handleCopyVenue(e, venue)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>{copiedVenueId === venue.id ? 'Copied Details!' : 'Share Ground'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(venue.id);
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                          >
                            Close Details ↑
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Footer with INR (₹) */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">From</span>
                        <span className="text-lg font-black text-[#0D1340] dark:text-white">
                          ₹{venue.startingPrice}
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/hr</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <SportsEquipmentButton
                          sportIcon={primarySportIcon}
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectVenue(venue);
                          }}
                        >
                          Book Ground
                        </SportsEquipmentButton>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-2xl mb-2.5">
              🏟️
            </div>
            <h3 className="text-base font-black text-[#0D1340] dark:text-white">No Venues Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Try adjusting your sport filter, city, or clearing the search keywords.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

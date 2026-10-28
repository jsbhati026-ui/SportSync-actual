import React, { useState, useRef } from 'react';
import { CommunityGearItem, SportType, GearRentalRecord, Player } from '../types';
import { SportsEquipmentButton } from './SportsEquipmentButton';
import {
  Share2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Plus,
  X,
  Calendar,
  Clock,
  Sparkles,
  Upload,
  Camera,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Shield,
  Info,
  Check,
} from 'lucide-react';
import { isItemInLocation, TRICITY_CITIES, getCoordinatesForArea } from '../lib/geoNotifications';

interface SportsRentalSectionProps {
  gearItems: CommunityGearItem[];
  selectedSport: SportType;
  selectedCity?: string;
  userCoords?: { lat: number; lng: number };
  currentUser: Player;
  onConfirmRental: (record: GearRentalRecord) => void;
  onAddNewGear: (item: CommunityGearItem) => void;
}

export const SportsRentalSection: React.FC<SportsRentalSectionProps> = ({
  gearItems,
  selectedSport,
  selectedCity = 'Bengaluru',
  userCoords,
  currentUser,
  onConfirmRental,
  onAddNewGear,
}) => {
  const [activeGear, setActiveGear] = useState<CommunityGearItem | null>(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [borrowDays, setBorrowDays] = useState<number>(1);
  const [rentalType, setRentalType] = useState<'day' | 'match'>('day');
  const [successRental, setSuccessRental] = useState<GearRentalRecord | null>(null);
  const [gearFilterTab, setGearFilterTab] = useState<'all' | 'my_gear'>('all');
  const [expandedGearIds, setExpandedGearIds] = useState<Record<string, boolean>>({});
  const [copiedGearId, setCopiedGearId] = useState<string | null>(null);

  // Listing Form State
  const [newSport, setNewSport] = useState<SportType>('cricket');
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newPricePerDay, setNewPricePerDay] = useState<number>(100);
  const [newDeposit, setNewDeposit] = useState<number>(300);
  const [newCondition, setNewCondition] = useState<CommunityGearItem['condition']>('Match Ready');
  const [newAvailability, setNewAvailability] = useState('Idle at home, available on weekends & evenings');
  const [newLocality, setNewLocality] = useState(currentUser.locality || 'Indiranagar');
  const [newDescription, setNewDescription] = useState('');
  const [newSpecs, setNewSpecs] = useState('');

  // Picture upload state
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [imageSourceMode, setImageSourceMode] = useState<'file' | 'preset'>('file');
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTricity = TRICITY_CITIES.includes(selectedCity);

  const defaultImages: Record<SportType, string> = {
    cricket: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=800&q=80',
    football: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    badminton: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    tennis: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
    all: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=800&q=80',
  };

  const presetPhotos: { label: string; url: string; sport: SportType }[] = [
    {
      label: 'English Willow Cricket Bat',
      url: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=800&q=80',
      sport: 'cricket',
    },
    {
      label: 'Batting Pads & Helmet Kit',
      url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
      sport: 'cricket',
    },
    {
      label: 'Yonex Badminton Racket',
      url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
      sport: 'badminton',
    },
    {
      label: 'Turf Studs & Match Football',
      url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
      sport: 'football',
    },
    {
      label: 'Wilson Tennis Racket',
      url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
      sport: 'tennis',
    },
    {
      label: 'Official Basketball',
      url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
      sport: 'basketball',
    },
  ];

  const myListedGear = gearItems.filter((gear) => gear.owner.id === currentUser.id);

  // Location filtering: updates dynamically when selectedCity or userCoords change!
  const filteredGear = gearItems.filter((gear) => {
    const matchesSport = selectedSport === 'all' || gear.sport === selectedSport;
    if (!matchesSport) return false;

    if (gearFilterTab === 'my_gear') {
      return gear.owner.id === currentUser.id;
    }

    // Proximity and City filter
    const matchesLocation =
      isItemInLocation(
        {
          city: gear.city,
          area: gear.area || gear.owner.locality,
          lat: gear.lat,
          lng: gear.lng,
        },
        selectedCity,
        userCoords?.lat,
        userCoords?.lng,
        40
      ) ||
      gear.owner.locality.toLowerCase().includes(selectedCity.toLowerCase()) ||
      gear.pickupLocation.toLowerCase().includes(selectedCity.toLowerCase()) ||
      (gear.city && gear.city.toLowerCase() === selectedCity.toLowerCase());

    return matchesLocation;
  });

  const toggleExpand = (gearId: string) => {
    setExpandedGearIds((prev) => ({
      ...prev,
      [gearId]: !prev[gearId],
    }));
  };

  const handleCopyGear = (e: React.MouseEvent, item: CommunityGearItem) => {
    e.stopPropagation();
    const text = `📦 SportsSync Community Gear: ${item.title} (${item.brand})\n💰 Rent: ₹${item.pricePerDay}/day (Match: ₹${item.pricePerMatch})\n🛡️ Refundable Deposit: ₹${item.depositRefundable}\n📍 Pickup: ${item.pickupLocation}, ${item.city || selectedCity}\n👤 Owner: ${item.owner.name} (★ ${item.owner.rating} Verified)\nBorrow on SportsSync!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedGearId(item.id);
    setTimeout(() => setCopiedGearId(null), 2200);
  };

  const handleOpenBorrowModal = (gear: CommunityGearItem, type: 'day' | 'match' = 'day') => {
    setActiveGear(gear);
    setRentalType(type);
    setBorrowDays(1);
    setSuccessRental(null);
  };

  const handleConfirmBorrow = () => {
    if (!activeGear) return;

    const matchPrice = activeGear.pricePerMatch || Math.round(activeGear.pricePerDay * 0.6);
    const totalCost = rentalType === 'day' ? activeGear.pricePerDay * borrowDays : matchPrice;
    const record: GearRentalRecord = {
      id: `rent_${Date.now()}`,
      rentalRef: `GEAR-${Math.floor(10000 + Math.random() * 90000)}`,
      gear: activeGear,
      pickupDate: 'Today / Hand-to-Hand',
      durationDays: rentalType === 'day' ? borrowDays : 1,
      totalCost,
      deposit: activeGear.depositRefundable,
      ownerContact: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: 'Ready for Pickup',
    };

    onConfirmRental(record);
    setSuccessRental(record);
  };

  // Image Upload Handlers
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo is larger than 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setUploadedImage(e.target.result);
        setSelectedPresetImage('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const coords = getCoordinatesForArea(newLocality, selectedCity);
    const finalImage =
      uploadedImage ||
      selectedPresetImage ||
      defaultImages[newSport] ||
      defaultImages.cricket;

    const parsedSpecs = newSpecs
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newItem: CommunityGearItem = {
      id: `p2p_${Date.now()}`,
      title: newTitle,
      sport: newSport,
      category:
        newSport === 'cricket'
          ? 'bat'
          : newSport === 'badminton' || newSport === 'tennis'
          ? 'racket'
          : 'ball',
      brand: newBrand || 'Standard Edition',
      image: finalImage,
      city: selectedCity,
      area: newLocality,
      lat: coords.lat,
      lng: coords.lng,
      owner: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        locality: `${newLocality}, ${selectedCity}`,
        distanceKm: 0.5,
        rating: 5.0,
        verified: true,
      },
      pricePerDay: Number(newPricePerDay),
      pricePerMatch: Math.round(Number(newPricePerDay) * 0.6),
      depositRefundable: Number(newDeposit),
      condition: newCondition,
      availability: newAvailability,
      description:
        newDescription ||
        'Sparingly used sports gear, sanitised and ready to lend to fellow players in our neighborhood.',
      pickupLocation: `${newLocality}, ${selectedCity}`,
      specs:
        parsedSpecs.length > 0
          ? parsedSpecs
          : ['Direct owner hand-to-hand pickup', 'Sanitized & inspected', 'Available immediately'],
    };

    onAddNewGear(newItem);
    setIsListModalOpen(false);

    // Reset form
    setNewTitle('');
    setNewBrand('');
    setNewDescription('');
    setNewSpecs('');
    setUploadedImage('');
    setSelectedPresetImage('');
  };

  return (
    <section className="py-8 sm:py-12 bg-white dark:bg-slate-950 transition-colors" id="community-gear-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Warm Community Header */}
        <div className="bg-slate-900 dark:bg-slate-900/90 rounded-2xl p-5 sm:p-7 text-white shadow-lg mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 dark:border-slate-800">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider mb-1">
              <Share2 className="w-3.5 h-3.5" />
              Community Peer-to-Peer Gear Sharing & Rentals
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Borrow Gear or Rent Out Your Own
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
              Have a cricket bat, football studs, or badminton racket lying unused?{' '}
              <strong>Rent your own gear to neighbors</strong> to earn daily returns with 100% refundable security
              deposits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <SportsEquipmentButton
              id="rent-my-own-gear-btn"
              sportIcon="gear"
              variant="accent"
              size="md"
              onClick={() => setIsListModalOpen(true)}
            >
              + Rent My Own Gear
            </SportsEquipmentButton>
          </div>
        </div>

        {/* Section Tabs & Location Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGearFilterTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  gearFilterTab === 'all'
                    ? 'bg-[#0D1340] dark:bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Available Nearby ({filteredGear.length})
              </button>

              <button
                id="my-listed-gear-tab-btn"
                onClick={() => setGearFilterTab('my_gear')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  gearFilterTab === 'my_gear'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>My Listed Gear ({myListedGear.length})</span>
              </button>
            </div>

            {/* Dynamic Location Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 text-xs font-black">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {selectedCity} {isTricity ? '(Tricity)' : ''}
              </span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px]">
                {filteredGear.length} Items
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            ⚡ 100% Refundable Security Deposit via UPI • Local Hand-to-Hand Pickup
          </div>
        </div>

        {/* Empty state when user clicks My Listed Gear and has none */}
        {gearFilterTab === 'my_gear' && filteredGear.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center my-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              You haven't listed any equipment to rent yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Got idle bats, balls, rackets, or sports gear at home? List it today with photos to earn extra income and
              help fellow players play.
            </p>
            <SportsEquipmentButton
              sportIcon="gear"
              variant="court"
              size="sm"
              onClick={() => setIsListModalOpen(true)}
            >
              + Rent My Own Gear Now
            </SportsEquipmentButton>
          </div>
        ) : filteredGear.length === 0 ? (
          /* Empty state when city has no items listed yet */
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 my-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl mb-2.5">
              📦
            </div>
            <h3 className="text-base font-black text-[#0D1340] dark:text-white">
              No Equipment Listed in {selectedCity} Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Be the first athlete to list your idle sports equipment in {selectedCity}! Earn money and build your neighborhood sports community.
            </p>
            <SportsEquipmentButton
              sportIcon="gear"
              variant="primary"
              size="sm"
              onClick={() => setIsListModalOpen(true)}
            >
              + List My Gear in {selectedCity}
            </SportsEquipmentButton>
          </div>
        ) : (
          /* Expandable Community Gear Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" id="gear-items-list">
            {filteredGear.map((item) => {
              const isExpanded = Boolean(expandedGearIds[item.id]);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleExpand(item.id)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(item.id);
                    }
                  }}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between cursor-pointer text-left focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                    isExpanded
                      ? 'border-emerald-500/80 dark:border-emerald-500/80 shadow-xl ring-2 ring-emerald-500/15'
                      : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-800'
                  }`}
                  id={`gear-item-${item.id}`}
                >
                  <div>
                    {/* Photo with Sport & Condition badge */}
                    <div className="relative h-44 rounded-xl overflow-hidden mb-3 bg-slate-900">
                      <img
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="px-2 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                          {item.sport}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs">
                          {item.condition}
                        </span>
                      </div>

                      {/* Expand / Collapse badge on photo */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(item.id);
                        }}
                        className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/75 hover:bg-black/90 text-white text-[10px] font-black flex items-center gap-1 backdrop-blur-xs transition-colors"
                      >
                        <span>{isExpanded ? 'Collapse' : 'Details'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3 text-emerald-400" /> : <ChevronDown className="w-3 h-3 text-slate-300" />}
                      </button>
                    </div>

                    {/* Brand & Title */}
                    <div className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      {item.brand}
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#0D1340] dark:text-white leading-snug line-clamp-1 mt-0.5">
                      {item.title}
                    </h3>

                    {/* Owner Info Snippet */}
                    <div className="mt-2.5 flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                      <img
                        src={item.owner.avatar}
                        alt={item.owner.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500 shrink-0"
                      />
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1">
                          {item.owner.name}
                          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 inline" />
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          {item.owner.locality}
                        </div>
                      </div>
                    </div>

                    {/* Availability Note */}
                    <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 bg-emerald-50/60 dark:bg-emerald-950/30 p-1.5 rounded-lg border border-emerald-100/60 dark:border-emerald-900/40">
                      💬 "{item.availability}"
                    </p>
                  </div>

                  {/* EXPANDABLE SECTION: Full Specifications, Description & Handover Info */}
                  {isExpanded && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
                      {/* Full Specifications */}
                      {item.specs && item.specs.length > 0 && (
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                            <Info className="w-3 h-3 text-emerald-600" />
                            Equipment Specifications
                          </h4>
                          <div className="space-y-1">
                            {item.specs.map((spec, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300"
                              >
                                <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span>{spec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Equipment Story & Description */}
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                          Equipment Story
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                          {item.description}
                        </p>
                      </div>

                      {/* Pickup & Deposit Guarantee */}
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200 font-black text-[11px]">
                          <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          100% Refundable Deposit Policy
                        </div>
                        <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                          ₹{item.depositRefundable} deposit held securely in escrow and returned immediately via UPI when the
                          gear is returned in good condition.
                        </p>
                      </div>

                      {/* Quick Match Rental option vs Day Rental */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-bold block">Match Duration</span>
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            ₹{item.pricePerMatch}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Single match</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-bold block">Full Day</span>
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            ₹{item.pricePerDay}
                          </span>
                          <span className="text-[10px] text-slate-500 block">24 hours</span>
                        </div>
                      </div>

                      {/* Share Gear Link */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={(e) => handleCopyGear(e, item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{copiedGearId === item.id ? 'Copied Gear Link!' : 'Share Equipment'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(item.id);
                          }}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                        >
                          Close Details ↑
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Price & Borrow Action */}
                  <div className="mt-3.5 pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Rent</span>
                      <span className="text-base font-black text-[#0D1340] dark:text-white">
                        ₹{item.pricePerDay}
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/day</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <SportsEquipmentButton
                        sportIcon={item.sport === 'all' ? 'gear' : item.sport}
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenBorrowModal(item, 'day');
                        }}
                      >
                        Borrow
                      </SportsEquipmentButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Borrow Modal */}
        {activeGear && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-5 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveGear(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {!successRental ? (
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-700 dark:text-emerald-400 mb-1">
                    <Share2 className="w-4 h-4" />
                    Borrow from Neighbor
                  </div>
                  <h3 className="text-lg font-black text-[#0D1340] dark:text-white leading-tight">
                    {activeGear.title}
                  </h3>

                  {/* Owner Card */}
                  <div className="mt-3 flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <img
                      src={activeGear.owner.avatar}
                      alt={activeGear.owner.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
                    />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        {activeGear.owner.name}
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded font-black">
                          {activeGear.owner.rating} ★ Verified
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {activeGear.pickupLocation || activeGear.owner.locality} • Direct Handover
                      </p>
                    </div>
                  </div>

                  {/* Rental Plan Option (Day vs Match) */}
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Rental Plan
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRentalType('day')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          rentalType === 'day'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-black">Full Day Rental</div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                          ₹{activeGear.pricePerDay}
                          <span className="text-[10px] font-normal text-slate-500">/day</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRentalType('match')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          rentalType === 'match'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-black">Single Match</div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                          ₹{activeGear.pricePerMatch}
                          <span className="text-[10px] font-normal text-slate-500">/match</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Days Selector (when rentalType is 'day') */}
                  {rentalType === 'day' && (
                    <div className="mt-3">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Borrow Duration
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 5].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setBorrowDays(d)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-colors cursor-pointer ${
                              borrowDays === d
                                ? 'bg-[#0D1340] dark:bg-blue-600 text-white border-[#0D1340] dark:border-blue-600'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {d} Day{d > 1 ? 's' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing Summary */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>
                        Rent (
                        {rentalType === 'day'
                          ? `₹${activeGear.pricePerDay} × ${borrowDays} day${borrowDays > 1 ? 's' : ''}`
                          : `₹${activeGear.pricePerMatch || Math.round(activeGear.pricePerDay * 0.6)} single match`}
                        )
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        ₹{rentalType === 'day' ? activeGear.pricePerDay * borrowDays : (activeGear.pricePerMatch || Math.round(activeGear.pricePerDay * 0.6))}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>100% Refundable Deposit (Returned on handover)</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{activeGear.depositRefundable}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-sm text-[#0D1340] dark:text-white">
                      <span>Total Payable via UPI</span>
                      <span>
                        ₹
                        {(rentalType === 'day'
                          ? activeGear.pricePerDay * borrowDays
                          : (activeGear.pricePerMatch || Math.round(activeGear.pricePerDay * 0.6))) + activeGear.depositRefundable}
                      </span>
                    </div>
                  </div>

                  {/* Confirm CTA */}
                  <SportsEquipmentButton
                    sportIcon={activeGear.sport === 'all' ? 'gear' : activeGear.sport}
                    variant="primary"
                    size="md"
                    className="w-full mt-4"
                    onClick={handleConfirmBorrow}
                  >
                    Confirm & Contact Owner via UPI
                  </SportsEquipmentButton>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black text-[#0D1340] dark:text-white">Borrow Request Sent!</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Reference:{' '}
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                      {successRental.rentalRef}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {activeGear.owner.name} has been notified. You can pick up the gear at {activeGear.pickupLocation}. Contact:{' '}
                    <span className="font-bold text-slate-800 dark:text-slate-200">{successRental.ownerContact}</span>
                  </p>
                  <button
                    onClick={() => setActiveGear(null)}
                    className="mt-4 w-full py-2 rounded-xl bg-[#0D1340] dark:bg-blue-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* List Idle Gear Modal with Picture Upload Option */}
        {isListModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsListModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  Earn from Unused Sports Equipment
                </div>
                <h3 className="text-lg font-black text-[#0D1340] dark:text-white mt-0.5">
                  Rent Your Own Gear in {selectedCity}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Put your idle bats, rackets, studs, balls, and protective gear to work. Add your photos, set your price,
                  and earn extra income with zero risk.
                </p>
              </div>

              <form onSubmit={handleCreateListing} className="space-y-3.5">
                {/* 1. PHOTO UPLOAD SECTION */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Gear Photo / Picture
                    </label>
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setImageSourceMode('file')}
                        className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                          imageSourceMode === 'file'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Upload Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageSourceMode('preset')}
                        className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                          imageSourceMode === 'preset'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Choose Preset
                      </button>
                    </div>
                  </div>

                  {imageSourceMode === 'file' ? (
                    <div>
                      {uploadedImage ? (
                        <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 bg-slate-900 h-44 flex items-center justify-center">
                          <img
                            src={uploadedImage}
                            alt="Gear preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-slate-100"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              Change Photo
                            </button>
                            <button
                              type="button"
                              onClick={() => setUploadedImage('')}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-rose-700"
                            >
                              <X className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
                            isDragging
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/40'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                            Click to upload gear picture or drag & drop
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            PNG, JPG, or WEBP up to 5MB (Photos taken with phone camera look best!)
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Preset Photo Gallery */
                    <div>
                      <div className="grid grid-cols-3 gap-2">
                        {presetPhotos.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedPresetImage(preset.url);
                              setUploadedImage('');
                            }}
                            className={`p-1.5 rounded-xl border text-left cursor-pointer transition-all relative overflow-hidden ${
                              selectedPresetImage === preset.url
                                ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.label}
                              className="w-full h-16 object-cover rounded-lg"
                            />
                            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate mt-1">
                              {preset.label}
                            </div>
                            {selectedPresetImage === preset.url && (
                              <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">
                                ✓
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sport Selection */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Sport
                  </label>
                  <select
                    value={newSport}
                    onChange={(e) => setNewSport(e.target.value as SportType)}
                    className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="cricket">Cricket (Bat, Pads, Kit)</option>
                    <option value="badminton">Badminton (Rackets, Bag)</option>
                    <option value="football">Football (Turf Studs, Ball)</option>
                    <option value="basketball">Basketball (Ball, Pump)</option>
                    <option value="tennis">Tennis (Racket, Balls)</option>
                  </select>
                </div>

                {/* Equipment Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Equipment Name / Model
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. SS Ton Kashmir Willow Cricket Bat / Yonex Astrox Racket"
                    className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Brand (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="e.g. SG, Yonex, Wilson, Nivia, Kipsta, Cosco"
                    className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Rent & Deposit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Rent (₹ / day)
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={2000}
                      required
                      value={newPricePerDay}
                      onChange={(e) => setNewPricePerDay(Number(e.target.value))}
                      className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Refundable Deposit (₹)
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={5000}
                      required
                      value={newDeposit}
                      onChange={(e) => setNewDeposit(Number(e.target.value))}
                      className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Condition
                  </label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as CommunityGearItem['condition'])}
                    className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Match Ready">Match Ready (Seasoned, tested)</option>
                    <option value="Like New">Like New (Barely used, pristine)</option>
                    <option value="Gently Used">Gently Used (Good solid condition)</option>
                  </select>
                </div>

                {/* Pickup Area / Locality */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Pickup Neighborhood / Locality (in {selectedCity})
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocality}
                    onChange={(e) => setNewLocality(e.target.value)}
                    placeholder={`e.g. Sector 35, Indiranagar, Bandra West, Whitefield`}
                    className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Specifications */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Key Specifications (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newSpecs}
                    onChange={(e) => setNewSpecs(e.target.value)}
                    placeholder="e.g. Short Handle, 1180 grams, BG65 Strings @ 26 lbs, Size UK 9"
                    className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Availability Note */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Availability / Idle Note
                  </label>
                  <input
                    type="text"
                    value={newAvailability}
                    onChange={(e) => setNewAvailability(e.target.value)}
                    placeholder="e.g. Free all weekdays and Saturday mornings"
                    className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Equipment Story / Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Tell borrowers about your gear, how it handles, and any accessories included."
                    className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="pt-2">
                  <SportsEquipmentButton
                    sportIcon={newSport === 'all' ? 'gear' : newSport}
                    variant="primary"
                    size="md"
                    className="w-full"
                    type="submit"
                  >
                    List Gear in {selectedCity}
                  </SportsEquipmentButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

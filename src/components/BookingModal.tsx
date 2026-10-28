import React, { useState } from 'react';
import { Venue, Court, TimeSlot, VenueBookingRecord } from '../types';
import { SportsEquipmentButton } from './SportsEquipmentButton';
import { X, CheckCircle2, Clock, Calendar, MapPin, Share2 } from 'lucide-react';

interface BookingModalProps {
  venue: Venue | null;
  onClose: () => void;
  onConfirmBooking: (record: VenueBookingRecord) => void;
  onConvertToMatch?: (booking: VenueBookingRecord) => void;
}

const AVAILABLE_TIMES: { time: string; isPeak: boolean; priceMult: number }[] = [
  { time: '06:00 - 07:00 AM', isPeak: false, priceMult: 0.85 },
  { time: '07:00 - 08:00 AM', isPeak: false, priceMult: 0.9 },
  { time: '08:00 - 09:00 AM', isPeak: false, priceMult: 0.9 },
  { time: '04:00 - 05:00 PM', isPeak: true, priceMult: 1.0 },
  { time: '05:00 - 06:00 PM', isPeak: true, priceMult: 1.15 },
  { time: '06:00 - 07:00 PM', isPeak: true, priceMult: 1.25 },
  { time: '07:00 - 08:00 PM', isPeak: true, priceMult: 1.25 },
  { time: '08:00 - 09:00 PM', isPeak: true, priceMult: 1.2 },
  { time: '09:00 - 10:00 PM', isPeak: true, priceMult: 1.1 },
  { time: '10:00 - 11:00 PM', isPeak: false, priceMult: 0.9 },
];

export const BookingModal: React.FC<BookingModalProps> = ({
  venue,
  onClose,
  onConfirmBooking,
  onConvertToMatch,
}) => {
  if (!venue) return null;

  const [selectedCourt, setSelectedCourt] = useState<Court>(venue.courts[0]);
  const [selectedDate, setSelectedDate] = useState<string>('Today');
  const [selectedSlot, setSelectedSlot] = useState<string>(AVAILABLE_TIMES[4].time);
  const [splitPayment, setSplitPayment] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [createdBooking, setCreatedBooking] = useState<VenueBookingRecord | null>(null);

  const currentSlotMeta = AVAILABLE_TIMES.find((t) => t.time === selectedSlot) || AVAILABLE_TIMES[4];
  const courtPrice = Math.round(selectedCourt.basePrice * currentSlotMeta.priceMult);
  const grandTotal = courtPrice;
  const splitPerPerson = Math.round(grandTotal / 4);

  const handleCompleteBooking = () => {
    const bookingRef = `SS-IN-${Math.floor(100000 + Math.random() * 900000)}`;
    const timeSlotObj: TimeSlot = {
      id: `slot_${Date.now()}`,
      time: selectedSlot,
      price: courtPrice,
      courtId: selectedCourt.id,
      courtName: selectedCourt.name,
      isPeak: currentSlotMeta.isPeak,
      isAvailable: true,
    };

    const record: VenueBookingRecord = {
      id: `bkg_${Date.now()}`,
      bookingRef,
      venue,
      court: selectedCourt,
      date: selectedDate,
      slot: timeSlotObj,
      totalPaid: grandTotal,
      bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Confirmed',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${bookingRef}`,
    };

    setCreatedBooking(record);
    setIsSuccess(true);
    onConfirmBooking(record);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150" id="booking-modal-overlay">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-8">
        {/* Header with Venue Photo */}
        <div className="relative h-28 sm:h-32 bg-[#0D1340] text-white p-4 sm:p-5 flex flex-col justify-end">
          <img
            src={venue.coverImage}
            alt={venue.name}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1340] via-[#0D1340]/80 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
              Slot Booking (India)
            </span>
            <h3 className="text-base sm:text-xl font-black text-white">{venue.name}</h3>
            <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
              {venue.address}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
          {!isSuccess ? (
            <div className="space-y-5">
              {/* Step 1: Select Court */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  1. Select Court or Net
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {venue.courts.map((court) => {
                    const isSelected = selectedCourt.id === court.id;
                    return (
                      <div
                        key={court.id}
                        onClick={() => setSelectedCourt(court)}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#0D1340] dark:text-white">
                            {court.name}
                          </span>
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                            ₹{court.basePrice}/hr
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{court.surface}</span>
                          <span className="text-slate-400 dark:text-slate-600">•</span>
                          <span>{court.isIndoor ? 'Indoor' : 'Outdoor'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Date and Time Slot Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    2. Choose Date & Time
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {['Today', 'Tomorrow', 'Weekend'].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                          selectedDate === d
                            ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_TIMES.map((slot) => {
                    const isSelected = selectedSlot === slot.time;
                    const price = Math.round(selectedCourt.basePrice * slot.priceMult);
                    return (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#0D1340] dark:bg-blue-600 text-white border-[#0D1340] dark:border-blue-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight">
                          {slot.time}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-[10px] font-extrabold ${isSelected ? 'text-blue-300 dark:text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {slot.isPeak ? '⚡ Evening Prime' : 'Morning / Day'}
                          </span>
                          <span className={`text-xs font-black ${isSelected ? 'text-amber-400 dark:text-amber-300' : 'text-blue-700 dark:text-blue-400'}`}>
                            ₹{price}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Split Payment Option (UPI / Squad) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                    <span>👥 Split Bill via UPI with 4 Players</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
                    Pay only your share now (₹{splitPerPerson}) and send UPI payment links to your squad.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={splitPayment}
                  onChange={(e) => setSplitPayment(e.target.checked)}
                  className="w-5 h-5 rounded-md text-blue-600 accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Summary & Booking Confirmation */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total to Pay (UPI / Card):</div>
                  <div className="text-2xl font-black text-[#0D1340] dark:text-white">
                    ₹{splitPayment ? splitPerPerson : grandTotal}{' '}
                    {splitPayment && (
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        (Your 1/4 share of ₹{grandTotal})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <SportsEquipmentButton
                    id="confirm-booking-btn"
                    sportIcon="trophy"
                    variant="primary"
                    size="md"
                    onClick={handleCompleteBooking}
                    className="flex-1 sm:flex-initial"
                  >
                    Lock Slot (Pay via UPI)
                  </SportsEquipmentButton>
                </div>
              </div>
            </div>
          ) : (
            /* Confirmation Pass View */
            createdBooking && (
              <div className="py-2 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-900/50">
                    Slot Locked & Confirmed
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0D1340] dark:text-white mt-1.5">
                    Your Ground is Booked!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Booking Reference: <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{createdBooking.bookingRef}</span>
                  </p>
                </div>

                {/* Digital Court Pass Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left max-w-md mx-auto shadow-xs">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                        Venue & Court
                      </div>
                      <div className="text-sm font-extrabold text-[#0D1340] dark:text-white">
                        {createdBooking.venue.name}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {createdBooking.court.name} ({createdBooking.court.surface})
                      </div>
                      <div className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                        📅 {createdBooking.date} • {createdBooking.slot.time}
                      </div>
                    </div>
                    <img
                      src={createdBooking.qrCodeUrl}
                      alt="Booking QR Pass"
                      referrerPolicy="no-referrer"
                      className="w-18 h-18 bg-white p-1 rounded-lg border border-slate-200 dark:border-slate-600 shrink-0"
                    />
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Total Paid</span>
                    <span className="font-black text-slate-900 dark:text-white">
                      ₹{createdBooking.totalPaid}
                    </span>
                  </div>
                </div>

                {/* Matchmaking Option: Convert to open match if you need more players */}
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 text-left max-w-md mx-auto flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black text-purple-900 dark:text-purple-200">
                      Need players for this slot?
                    </div>
                    <div className="text-[11px] text-purple-700 dark:text-purple-300">
                      Post an open match to find players in your locality.
                    </div>
                  </div>
                  {onConvertToMatch && (
                    <button
                      onClick={() => {
                        onConvertToMatch(createdBooking);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shrink-0 transition-colors cursor-pointer"
                    >
                      Find Players
                    </button>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-xl bg-[#0D1340] dark:bg-blue-600 hover:bg-[#182361] dark:hover:bg-blue-700 text-white text-xs font-black transition-colors cursor-pointer"
                  >
                    View in My Activity
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

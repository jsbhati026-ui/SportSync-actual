export type SportType =
  | 'all'
  | 'cricket'
  | 'football'
  | 'badminton'
  | 'basketball'
  | 'tennis';

export interface TimeSlot {
  id: string;
  time: string; // e.g. "07:00 - 08:00 AM"
  price: number; // in INR (₹)
  courtId: string;
  courtName: string;
  isPeak: boolean;
  isAvailable: boolean;
}

export interface Court {
  id: string;
  name: string;
  surface: string; // e.g., "BWF Approved Synthetic", "FIFA Standard AstroTurf", "Hard Maple Hardwood", "Clay Court"
  isIndoor: boolean;
  basePrice: number; // in INR (₹)
}

export interface Venue {
  id: string;
  name: string;
  sports: SportType[];
  rating: number;
  reviewCount: number;
  distanceKm: number;
  area: string;
  city: string;
  address: string;
  coverImage: string;
  galleryImages: string[];
  startingPrice: number; // in INR (₹)
  openHours: string;
  amenities: string[];
  courts: Court[];
  availableSlotsCount: number;
  badge?: string;
}

export interface SportMatchRecord {
  sport: SportType;
  matches: number;
  wins: number;
  losses: number;
  winRate: number; // percentage e.g. 68
  mvps?: number;
}

export interface PlayerStats {
  totalMatchesPlayed: number;
  matchesBySport: SportMatchRecord[];
  hoursPlayed: number;
  winRatePercentage: number;
  reliabilityPercentage: number; // e.g. 98%
  fairPlayRating: number; // e.g. 4.9 / 5.0
  punctualityRating: number; // e.g. 4.8 / 5.0
  mvpAwards: number;
  recentForm: ('W' | 'L' | 'D')[]; // e.g. ['W', 'W', 'L', 'W', 'W']
  endorsements: { tag: string; count: number }[];
  favoriteRoles: string[];
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  rating: number; // Rating (e.g. 3.8 / 5.0)
  levelTitle: string; // "Intermediate", "Advanced", "All-Rounder", "Club Player"
  matchesPlayed: number;
  reliability: number; // e.g. 98%
  badge?: string;
  locality?: string;
  stats?: PlayerStats;
  bio?: string;
}

export interface ActivePlayerOnMap extends Player {
  status: 'ready_to_play' | 'looking_for_squad' | 'warming_up' | 'offline';
  statusText: string;
  currentArea: string;
  city: string;
  lat: number;
  lng: number;
  activeSport: SportType;
  preferredSports: SportType[];
  isFriend?: boolean;
  friendStatus?: 'none' | 'pending' | 'friends';
  distanceKm?: number;
  lastActive: string;
  stats: PlayerStats;
}

export interface Friend {
  id: string;
  playerId: string;
  name: string;
  avatar: string;
  sport: SportType;
  levelTitle: string;
  rating: number;
  status: 'online' | 'in_match' | 'offline';
  statusText?: string;
  lastSeen: string;
  matchesTogether: number;
  locality: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  receiverName: string;
  text: string;
  timestamp: string;
  isQuickInvite?: boolean;
  inviteDetails?: {
    sport: SportType;
    venueName: string;
    time: string;
  };
}

export interface PlayerRatingSubmission {
  id?: string;
  reviewerId: string;
  reviewerName: string;
  targetPlayerId: string;
  targetPlayerName: string;
  matchId: string;
  matchTitle: string;
  sport: SportType;
  overallRating: number; // 1-5
  punctualityRating: number; // 1-5
  sportsmanshipRating: number; // 1-5
  selectedTags: string[];
  feedbackComment?: string;
  createdAt: string;
}

export interface RecentTeammate {
  player: Player;
  matchId: string;
  matchTitle: string;
  sport: SportType;
  matchDate: string;
  venueName: string;
  hasRated: boolean;
  existingRating?: PlayerRatingSubmission;
}

export interface OpenMatch {
  id: string;
  sport: SportType;
  title: string;
  venueId: string;
  venueName: string;
  courtName: string;
  area: string;
  city?: string;
  lat?: number;
  lng?: number;
  date: string;
  time: string;
  durationMinutes: number;
  host: Player;
  playersJoined: Player[];
  maxPlayers: number;
  skillMin: number;
  skillMax: number;
  skillLabel: string;
  costPerPlayer: number; // in INR (₹)
  gameType: 'Friendly Match' | 'Competitive Sets' | 'Box Cricket 7v7' | 'Turf Futsal 5v5' | 'Pick-up Game' | string;
  gender: 'Open' | 'Men Only' | 'Women Only' | 'Mixed';
  includesBallsOrShuttles: boolean;
  notes?: string;
  isLive?: boolean;
  isLiveNow?: boolean;
  liveStatus?: string; // e.g. "2nd Innings (8.4 ov)", "2nd Half 38'", "Set 3 (18-17)", "Starting in 10 mins"
  liveScore?: string; // e.g. "78/4 in 8.4 ov", "3 - 2 (38')", "19-17 Game 3"
  emergencyPlayersNeeded?: number; // e.g. 1 or 2
  isUrgent?: boolean; // Pro broadcast enabled
  broadcastRadiusKm?: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  favoriteSports: SportType[];
  city: string;
  area: string;
  lat: number;
  lng: number;
  onboardingCompleted: boolean;
  isPro?: boolean;
  proExpiresAt?: string;
  stats?: PlayerStats;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchNotification {
  id: string;
  userId: string;
  matchId: string;
  matchTitle: string;
  sport: SportType;
  venueName: string;
  area: string;
  distanceKm: number;
  timestamp: string;
  read: boolean;
  date: string;
  time: string;
  isPlayNowAlert?: boolean;
  senderName?: string;
  senderAvatar?: string;
  broadcastId?: string;
}

export interface LivePlayNowBroadcast {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  sport: SportType;
  city: string;
  area: string;
  lat: number;
  lng: number;
  radiusKm: number;
  message: string;
  timestamp: string;
  expiresAt: string;
  notifiedCount: number;
  respondedPlayers?: Array<{
    playerId: string;
    name: string;
    avatar: string;
    distanceKm: number;
    status: 'joined' | 'on_the_way' | 'interested';
    message: string;
    timestamp: string;
  }>;
}

// Community P2P Gear Item (everyday players renting out idle equipment)
export interface CommunityGearItem {
  id: string;
  title: string;
  sport: SportType;
  category: 'bat' | 'racket' | 'ball' | 'protection' | 'footwear' | 'kit';
  brand: string;
  image: string;
  city?: string;
  area?: string;
  lat?: number;
  lng?: number;
  owner: {
    id: string;
    name: string;
    avatar: string;
    locality: string;
    distanceKm: number;
    rating: number;
    verified: boolean;
  };
  pricePerDay: number; // in INR (₹)
  pricePerMatch?: number; // in INR (₹)
  depositRefundable: number; // in INR (₹)
  condition: 'Like New' | 'Gently Used' | 'Match Ready';
  availability: string; // e.g. "Available on weekdays", "Available this weekend", "Ready for pickup today"
  description: string;
  pickupLocation: string;
  specs: string[];
}

export interface VenueBookingRecord {
  id: string;
  bookingRef: string;
  venue: Venue;
  court: Court;
  date: string;
  slot: TimeSlot;
  totalPaid: number; // in INR (₹)
  bookedAt: string;
  status: 'Confirmed' | 'Completed';
  qrCodeUrl: string;
}

export interface JoinedMatchRecord {
  id: string;
  match: OpenMatch;
  joinedAt: string;
  paymentStatus: 'Paid via UPI' | 'Pay at Ground';
  cost: number; // in INR (₹)
}

export interface GearRentalRecord {
  id: string;
  rentalRef: string;
  gear: CommunityGearItem;
  pickupDate: string;
  durationDays: number;
  totalCost: number; // in INR (₹)
  deposit: number; // in INR (₹)
  ownerContact: string;
  status: 'Confirmed' | 'Ready for Pickup' | 'Active' | 'Returned';
}

import { SportType, UserProfile, MatchNotification, OpenMatch } from '../types';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

// Standard geo-coordinates for Indian sports hubs & neighborhoods
export const INDIAN_AREA_COORDS: Record<string, { lat: number; lng: number; city: string }> = {
  // Bengaluru
  'Sarjapur Road': { lat: 12.925, lng: 77.684, city: 'Bengaluru' },
  'Indiranagar': { lat: 12.9784, lng: 77.6408, city: 'Bengaluru' },
  'Koramangala': { lat: 12.9352, lng: 77.6245, city: 'Bengaluru' },
  'HSR Layout': { lat: 12.9121, lng: 77.6446, city: 'Bengaluru' },
  'Whitefield': { lat: 12.9698, lng: 77.75, city: 'Bengaluru' },
  'Jayanagar': { lat: 12.9308, lng: 77.5838, city: 'Bengaluru' },

  // Delhi NCR
  'August Kranti Marg': { lat: 28.5528, lng: 77.2207, city: 'Delhi NCR' },
  'Siri Fort': { lat: 28.5528, lng: 77.2207, city: 'Delhi NCR' },
  'Noida Sector 62': { lat: 28.6258, lng: 77.3653, city: 'Delhi NCR' },
  'Cyber City': { lat: 28.495, lng: 77.0895, city: 'Delhi NCR' },

  // Mumbai
  'Malad West': { lat: 19.186, lng: 72.8485, city: 'Mumbai' },
  'Bandra West': { lat: 19.0596, lng: 72.8295, city: 'Mumbai' },
  'Andheri East': { lat: 19.1136, lng: 72.8697, city: 'Mumbai' },
  'Powai': { lat: 19.1176, lng: 72.906, city: 'Mumbai' },

  // Hyderabad
  'Gachibowli / Hitec City': { lat: 17.4401, lng: 78.3489, city: 'Hyderabad' },
  'Madhapur': { lat: 17.4483, lng: 78.3915, city: 'Hyderabad' },
  'Jubilee Hills': { lat: 17.4325, lng: 78.4073, city: 'Hyderabad' },

  // Chennai
  'Velachery / OMR': { lat: 12.9815, lng: 80.218, city: 'Chennai' },
  'Anna Nagar': { lat: 13.085, lng: 80.2101, city: 'Chennai' },

  // Pune
  'Viman Nagar': { lat: 18.5679, lng: 73.9143, city: 'Pune' },
  'Baner': { lat: 18.5597, lng: 73.7799, city: 'Pune' },
  'Kothrud': { lat: 18.5074, lng: 73.8077, city: 'Pune' },

  // Chandigarh & Nearby Places (Tricity)
  'Sector 12': { lat: 30.7620, lng: 76.7725, city: 'Chandigarh' },
  'Sector 14 / PU': { lat: 30.7595, lng: 76.7680, city: 'Chandigarh' },
  'Sector 11': { lat: 30.7570, lng: 76.7790, city: 'Chandigarh' },
  'Sector 15': { lat: 30.7510, lng: 76.7710, city: 'Chandigarh' },
  'Sector 16': { lat: 30.7485, lng: 76.7865, city: 'Chandigarh' },
  'Sector 17': { lat: 30.7398, lng: 76.7827, city: 'Chandigarh' },
  'Sector 18': { lat: 30.7360, lng: 76.7940, city: 'Chandigarh' },
  'Sector 19': { lat: 30.7300, lng: 76.7990, city: 'Chandigarh' },
  'Sector 20': { lat: 30.7220, lng: 76.7950, city: 'Chandigarh' },
  'Sector 22': { lat: 30.7350, lng: 76.7720, city: 'Chandigarh' },
  'Sector 23': { lat: 30.7360, lng: 76.7610, city: 'Chandigarh' },
  'Sector 26': { lat: 30.7270, lng: 76.8120, city: 'Chandigarh' },
  'Sector 34': { lat: 30.7225, lng: 76.7705, city: 'Chandigarh' },
  'Sector 35': { lat: 30.7252, lng: 76.7645, city: 'Chandigarh' },
  'Sector 36': { lat: 30.7310, lng: 76.7510, city: 'Chandigarh' },
  'Sector 42': { lat: 30.7289, lng: 76.7495, city: 'Chandigarh' },
  'Sector 43': { lat: 30.7203, lng: 76.7481, city: 'Chandigarh' },
  'Sector 8': { lat: 30.7420, lng: 76.7950, city: 'Chandigarh' },
  'Sector 9': { lat: 30.7460, lng: 76.7890, city: 'Chandigarh' },
  'Sector 10': { lat: 30.7520, lng: 76.7840, city: 'Chandigarh' },
  'Sector 7': { lat: 30.7370, lng: 76.8040, city: 'Chandigarh' },
  'Sukhna Lake': { lat: 30.7421, lng: 76.8188, city: 'Chandigarh' },
  'Manimajra': { lat: 30.7205, lng: 76.8456, city: 'Chandigarh' },
  'IT Park Chandigarh': { lat: 30.7230, lng: 76.8460, city: 'Chandigarh' },

  // Mohali (SAS Nagar)
  'Phase 7 / Sector 61': { lat: 30.7046, lng: 76.7179, city: 'Mohali' },
  'Phase 3B2': { lat: 30.7138, lng: 76.7196, city: 'Mohali' },
  'Phase 8': { lat: 30.6974, lng: 76.7287, city: 'Mohali' },
  'Phase 11': { lat: 30.6781, lng: 76.7328, city: 'Mohali' },
  'Sector 70 Mohali': { lat: 30.6982, lng: 76.7088, city: 'Mohali' },
  'Aerocity Mohali': { lat: 30.6482, lng: 76.7725, city: 'Mohali' },

  // Panchkula
  'Sector 20 Panchkula': { lat: 30.6778, lng: 76.8524, city: 'Panchkula' },
  'Sector 5 Panchkula': { lat: 30.6942, lng: 76.8606, city: 'Panchkula' },
  'MDC Sector 4': { lat: 30.7186, lng: 76.8491, city: 'Panchkula' },
  'Pinjore': { lat: 30.7963, lng: 76.9167, city: 'Panchkula' },

  // Zirakpur
  'VIP Road': { lat: 30.6425, lng: 76.8208, city: 'Zirakpur' },
  'Dhakoli': { lat: 30.6558, lng: 76.8375, city: 'Zirakpur' },
  'Airport Ring Road': { lat: 30.6385, lng: 76.8122, city: 'Zirakpur' },
};

// Default center coordinates per city
export const CITY_DEFAULT_COORDS: Record<string, { lat: number; lng: number }> = {
  'Chandigarh': { lat: 30.7333, lng: 76.7794 },
  'Mohali': { lat: 30.7046, lng: 76.7179 },
  'Panchkula': { lat: 30.6942, lng: 76.8606 },
  'Zirakpur': { lat: 30.6425, lng: 76.8208 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Delhi NCR': { lat: 28.6139, lng: 77.209 },
  'Mumbai': { lat: 19.076, lng: 72.8777 },
  'Hyderabad': { lat: 17.385, lng: 78.4867 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
};

export const TRICITY_CITIES = ['Chandigarh', 'Mohali', 'Panchkula', 'Zirakpur'];

/**
 * Checks if two cities belong to the same sports metro/region (e.g. Chandigarh Tricity)
 */
export function isSameMetroArea(city1: string, city2: string): boolean {
  if (!city1 || !city2) return false;
  const c1 = city1.toLowerCase().trim();
  const c2 = city2.toLowerCase().trim();
  if (c1 === c2) return true;
  const inTricity1 = TRICITY_CITIES.some((tc) => tc.toLowerCase() === c1);
  const inTricity2 = TRICITY_CITIES.some((tc) => tc.toLowerCase() === c2);
  if (inTricity1 && inTricity2) return true;
  return false;
}

/**
 * Checks if an item (match or venue) is within the user's location radius
 */
export function isItemInLocation(
  item: { city?: string; area?: string; lat?: number; lng?: number },
  currentCity: string,
  userLat?: number,
  userLng?: number,
  maxRadiusKm: number = 35
): boolean {
  if (!currentCity) return true;
  
  // 1. Direct city or metro region match
  if (item.city && isSameMetroArea(item.city, currentCity)) {
    return true;
  }

  // 2. Coordinate-based distance match
  const centerCoords = (userLat && userLng) ? { lat: userLat, lng: userLng } : (CITY_DEFAULT_COORDS[currentCity] || CITY_DEFAULT_COORDS['Bengaluru']);
  if (item.lat && item.lng && centerCoords) {
    const dist = calculateDistanceKm(centerCoords.lat, centerCoords.lng, item.lat, item.lng);
    return dist <= maxRadiusKm;
  }

  return false;
}

/**
 * Calculates exact distance between two coordinates using the Haversine formula
 * Returns distance in kilometers (rounded to 1 decimal place)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10;
}

/**
 * Resolve lat/lng from an area name and city
 */
export function getCoordinatesForArea(area: string, city: string = 'Bengaluru'): { lat: number; lng: number } {
  if (!area) {
    const cityCenter = CITY_DEFAULT_COORDS[city] || CITY_DEFAULT_COORDS['Bengaluru'];
    return { lat: cityCenter.lat, lng: cityCenter.lng };
  }

  // Direct match
  if (INDIAN_AREA_COORDS[area]) {
    return { lat: INDIAN_AREA_COORDS[area].lat, lng: INDIAN_AREA_COORDS[area].lng };
  }

  // Token / Substring matching against known areas
  const normalizedArea = area.toLowerCase().trim();
  const areaKey = Object.keys(INDIAN_AREA_COORDS).find((k) => {
    const normK = k.toLowerCase();
    if (normalizedArea.includes(normK) || normK.includes(normalizedArea)) return true;
    // Check tokens like "Sector 42", "Phase 7", "Sarjapur", "Whitefield", "VIP Road"
    const subParts = normK.split(/[\/\,\-]/).map((p) => p.trim());
    return subParts.some((part) => part.length >= 4 && normalizedArea.includes(part));
  });

  if (areaKey) {
    return { lat: INDIAN_AREA_COORDS[areaKey].lat, lng: INDIAN_AREA_COORDS[areaKey].lng };
  }

  // Fallback to the specified city's center coordinates
  const cityCenter = CITY_DEFAULT_COORDS[city] || CITY_DEFAULT_COORDS['Bengaluru'];
  let hash = 0;
  for (let i = 0; i < area.length; i++) {
    hash = (hash << 5) - hash + area.charCodeAt(i);
    hash |= 0;
  }
  const jitterLat = ((hash % 100) / 100) * 0.02 - 0.01;
  const jitterLng = (((hash >> 2) % 100) / 100) * 0.02 - 0.01;

  return {
    lat: Number((cityCenter.lat + jitterLat).toFixed(4)),
    lng: Number((cityCenter.lng + jitterLng).toFixed(4)),
  };
}

/**
 * Finds the closest supported Indian city and neighborhood from latitude and longitude coordinates.
 */
export function findClosestIndianCity(
  lat: number,
  lng: number
): {
  city: string;
  area: string;
  distanceKm: number;
  lat: number;
  lng: number;
} {
  let closest = {
    city: 'Bengaluru',
    area: 'Sarjapur Road',
    distanceKm: Infinity,
    lat: 12.925,
    lng: 77.684,
  };

  // 1. Check all specific area coordinates
  for (const [areaName, data] of Object.entries(INDIAN_AREA_COORDS)) {
    const dist = calculateDistanceKm(lat, lng, data.lat, data.lng);
    if (dist < closest.distanceKm) {
      closest = {
        city: data.city,
        area: areaName,
        distanceKm: dist,
        lat: data.lat,
        lng: data.lng,
      };
    }
  }

  // 2. Also check all city center coordinates
  for (const [cityName, data] of Object.entries(CITY_DEFAULT_COORDS)) {
    const dist = calculateDistanceKm(lat, lng, data.lat, data.lng);
    if (dist < closest.distanceKm) {
      const cityAreas = Object.entries(INDIAN_AREA_COORDS).filter(([_, d]) => d.city === cityName);
      const defaultArea = cityAreas.length > 0 ? cityAreas[0][0] : cityName;
      closest = {
        city: cityName,
        area: defaultArea,
        distanceKm: dist,
        lat: data.lat,
        lng: data.lng,
      };
    }
  }

  return {
    city: closest.city,
    area: closest.area,
    distanceKm: closest.distanceKm,
    lat, // Keep exact user coordinates
    lng, // Keep exact user coordinates
  };
}

/**
 * Reverse geocodes coordinates using OpenStreetMap Nominatim with local fallback
 * Accurately detects neighborhood/sector (e.g. Sector 12 vs Sector 17 in Chandigarh)
 */
export async function reverseGeocodeCoords(
  lat: number,
  lng: number
): Promise<{ city: string; area: string; formattedAddress: string; lat: number; lng: number }> {
  const fallback = findClosestIndianCity(lat, lng);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'SportsApp-LocationPicker/1.0',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      // Detect sector or neighborhood
      let area =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.quarter ||
        addr.city_district ||
        addr.road ||
        fallback.area;

      let city =
        addr.city ||
        addr.town ||
        addr.state_district ||
        addr.state ||
        fallback.city;

      // Special handling for Chandigarh sectors (e.g. "Sector 12", "Sector 17")
      if (
        (city.toLowerCase().includes('chandigarh') || addr.state?.toLowerCase().includes('chandigarh')) &&
        fallback.distanceKm < 2.5
      ) {
        area = fallback.area;
        city = 'Chandigarh';
      }

      const formattedAddress = data.display_name || `${area}, ${city}`;

      return {
        city,
        area,
        formattedAddress,
        lat,
        lng,
      };
    }
  } catch (e) {
    console.warn('Nominatim reverse geocoding fallback used:', e);
  }

  return {
    city: fallback.city,
    area: fallback.area,
    formattedAddress: `${fallback.area}, ${fallback.city}`,
    lat,
    lng,
  };
}

// Only real authenticated players registered in Firestore are used
export const SAMPLE_COMMUNITY_PLAYERS: UserProfile[] = [];


export interface ProximityAlertResult {
  notifiedUsersCount: number;
  notifiedUsers: Array<{
    uid: string;
    displayName: string;
    distanceKm: number;
    sport: SportType;
  }>;
  currentUserNotified: boolean;
  notificationForCurrentUser?: MatchNotification;
}

/**
 * Core Requirement:
 * When a game is created, this triggers notifications to all players who:
 * 1. Are within 10.0 km of the match location
 * 2. Have selected that particular sport as their favourite
 */
export async function triggerProximityMatchNotifications(
  match: OpenMatch,
  currentUser: UserProfile | null
): Promise<ProximityAlertResult> {
  const matchLat = match.lat || getCoordinatesForArea(match.area, match.city).lat;
  const matchLng = match.lng || getCoordinatesForArea(match.area, match.city).lng;

  // 1. Gather candidates from Firestore users collection
  const candidateUsers: UserProfile[] = [];

  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    usersSnapshot.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      if (data && data.favoriteSports) {
        candidateUsers.push(data);
      }
    });
  } catch (err) {
    console.warn('Could not read from Firestore users collection, using local profiles:', err);
  }

  // Combine with sample community players ensuring no duplicate uid
  for (const sample of SAMPLE_COMMUNITY_PLAYERS) {
    if (!candidateUsers.some((u) => u.uid === sample.uid)) {
      candidateUsers.push(sample);
    }
  }

  // If current logged-in user is not already in candidates, include them
  if (currentUser && !candidateUsers.some((u) => u.uid === currentUser.uid)) {
    candidateUsers.push(currentUser);
  }

  const notifiedUsers: Array<{
    uid: string;
    displayName: string;
    distanceKm: number;
    sport: SportType;
  }> = [];

  let currentUserNotified = false;
  let notificationForCurrentUser: MatchNotification | undefined = undefined;

  // 2. Evaluate each user:
  // - sport must be in their favoriteSports
  // - distance <= 10.0 km
  for (const user of candidateUsers) {
    // Check sport preference
    const lovesThisSport =
      user.favoriteSports &&
      (user.favoriteSports.includes(match.sport) || user.favoriteSports.includes('all'));

    if (!lovesThisSport) {
      continue;
    }

    // Check location
    const userLat = user.lat || (user.area ? getCoordinatesForArea(user.area, user.city).lat : null);
    const userLng = user.lng || (user.area ? getCoordinatesForArea(user.area, user.city).lng : null);

    if (userLat == null || userLng == null) {
      continue;
    }

    const distance = calculateDistanceKm(matchLat, matchLng, userLat, userLng);

    // Strict 10.0 km Radius Rule (Matches & Players within 10 km)
    if (distance <= 10.0) {
      const notifId = `notif_${Date.now()}_${user.uid.slice(0, 5)}`;
      const newNotif: MatchNotification = {
        id: notifId,
        userId: user.uid,
        matchId: match.id,
        matchTitle: match.title,
        sport: match.sport,
        venueName: match.venueName,
        area: match.area,
        distanceKm: distance,
        timestamp: new Date().toISOString(),
        read: false,
        date: match.date,
        time: match.time,
      };

      notifiedUsers.push({
        uid: user.uid,
        displayName: user.displayName || 'Sports Player',
        distanceKm: distance,
        sport: match.sport,
      });

      if (currentUser && user.uid === currentUser.uid) {
        currentUserNotified = true;
        notificationForCurrentUser = newNotif;
      }

      // Persist notification to Firestore user's notifications sub-collection
      try {
        const notifRef = doc(db, 'users', user.uid, 'notifications', notifId);
        // Non-blocking write
        setDoc(notifRef, newNotif).catch((e) =>
          console.warn('Error persisting notification to Firestore:', e)
        );
      } catch (e) {
        console.warn('Could not write notification doc:', e);
      }
    }
  }

  return {
    notifiedUsersCount: notifiedUsers.length,
    notifiedUsers,
    currentUserNotified,
    notificationForCurrentUser,
  };
}

export interface BroadcastPlayNowParams {
  sender: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
  sport: SportType;
  city: string;
  area: string;
  lat: number;
  lng: number;
  radiusKm: number;
  customMessage?: string;
}

export interface BroadcastPlayNowResult {
  broadcast: import('../types').LivePlayNowBroadcast;
  notifiedPlayers: Array<{
    uid: string;
    displayName: string;
    distanceKm: number;
    sport: SportType;
    avatar?: string;
  }>;
  totalNotified: number;
}

/**
 * Broadcasts an instant "Play Right Now" alert to all players within radiusKm (5-10km)
 * who play or love that sport, persisting to Firestore and alerting nearby athletes.
 */
export async function broadcastPlayNowAlert(
  params: BroadcastPlayNowParams
): Promise<BroadcastPlayNowResult> {
  const { sender, sport, city, area, lat, lng, radiusKm, customMessage } = params;
  const broadcastId = `bcast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour validity

  // 1. Gather all potential players
  const candidateUsers: UserProfile[] = [];
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    usersSnapshot.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      if (data && data.favoriteSports) {
        candidateUsers.push(data);
      }
    });
  } catch (err) {
    console.warn('Could not read from Firestore users, using sample profiles:', err);
  }

  // Combine with sample community players
  for (const sample of SAMPLE_COMMUNITY_PLAYERS) {
    if (!candidateUsers.some((u) => u.uid === sample.uid)) {
      candidateUsers.push(sample);
    }
  }

  const notifiedPlayers: Array<{
    uid: string;
    displayName: string;
    distanceKm: number;
    sport: SportType;
    avatar?: string;
  }> = [];

  // Filter candidate users within radius and who match the sport
  for (const user of candidateUsers) {
    if (user.uid === sender.uid) continue; // Don't notify self

    const lovesSport =
      sport === 'all' ||
      (user.favoriteSports &&
        (user.favoriteSports.includes(sport) || user.favoriteSports.includes('all')));

    if (!lovesSport) continue;

    const userLat = user.lat || (user.area ? getCoordinatesForArea(user.area, user.city).lat : null);
    const userLng = user.lng || (user.area ? getCoordinatesForArea(user.area, user.city).lng : null);

    if (userLat == null || userLng == null) continue;

    const distance = calculateDistanceKm(lat, lng, userLat, userLng);

    if (distance <= radiusKm) {
      const notifId = `notif_${Date.now()}_${user.uid.slice(0, 5)}`;
      const notifMsg: MatchNotification = {
        id: notifId,
        userId: user.uid,
        matchId: broadcastId,
        matchTitle: `${sender.displayName} is at ${area} playing ${sport.toUpperCase()} right now — Join them!`,
        sport: sport,
        venueName: `${area} Ground / Court`,
        area: area,
        distanceKm: distance,
        timestamp: now.toISOString(),
        read: false,
        date: 'Today',
        time: 'Right Now (Live)',
        isPlayNowAlert: true,
        senderName: sender.displayName,
        senderAvatar: sender.photoURL,
        broadcastId: broadcastId,
      };

      notifiedPlayers.push({
        uid: user.uid,
        displayName: user.displayName || 'Sports Athlete',
        distanceKm: distance,
        sport: sport,
        avatar: user.photoURL ?? undefined,
      });

      // Persist notification to recipient
      try {
        const notifRef = doc(db, 'users', user.uid, 'notifications', notifId);
        setDoc(notifRef, notifMsg).catch(() => {});
      } catch {}
    }
  }

  // Also add a confirmation notification to the sender
  try {
    const senderNotifId = `sender_notif_${Date.now()}`;
    const senderNotif: MatchNotification = {
      id: senderNotifId,
      userId: sender.uid,
      matchId: broadcastId,
      matchTitle: `Broadcast live! Alerted ${notifiedPlayers.length} players within ${radiusKm} km of ${area}`,
      sport: sport,
      venueName: `${area}`,
      area: area,
      distanceKm: 0,
      timestamp: now.toISOString(),
      read: false,
      date: 'Today',
      time: 'Live Now',
      isPlayNowAlert: true,
      senderName: sender.displayName,
      senderAvatar: sender.photoURL,
      broadcastId: broadcastId,
    };
    const senderRef = doc(db, 'users', sender.uid, 'notifications', senderNotifId);
    setDoc(senderRef, senderNotif).catch(() => {});
  } catch {}

  const broadcast: import('../types').LivePlayNowBroadcast = {
    id: broadcastId,
    senderId: sender.uid,
    senderName: sender.displayName,
    senderAvatar: sender.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    sport,
    city,
    area,
    lat,
    lng,
    radiusKm,
    message: customMessage || `I'm at ${area} ready to play ${sport} right now! Looking for players to join immediately.`,
    timestamp: now.toISOString(),
    expiresAt,
    notifiedCount: notifiedPlayers.length,
    respondedPlayers: [],
  };

  // Persist live broadcast to Firestore
  try {
    const broadcastRef = doc(db, 'live_broadcasts', broadcastId);
    await setDoc(broadcastRef, broadcast);
  } catch (e) {
    console.warn('Could not write broadcast to Firestore:', e);
  }

  return {
    broadcast,
    notifiedPlayers,
    totalNotified: notifiedPlayers.length,
  };
}


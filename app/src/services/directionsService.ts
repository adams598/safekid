import { NavigationMode } from '../types';

// Change to your backend URL when deploying
const API_BASE = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.safekid.app/api';

export interface DirectionsStep {
  instruction: string;
  distanceText: string;
  distanceValue: number;
  durationText: string;
  maneuver: string;
  startLocation: { latitude: number; longitude: number };
}

export interface DirectionsResult {
  mode: NavigationMode;
  distanceText: string;
  distanceValue: number;
  durationText: string;
  durationValue: number;
  startAddress: string;
  endAddress: string;
  overviewPolyline: { latitude: number; longitude: number }[];
  steps: DirectionsStep[];
  bounds: {
    northeast: { latitude: number; longitude: number };
    southwest: { latitude: number; longitude: number };
  };
}

export async function getDirections(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  mode: NavigationMode,
  token?: string,
): Promise<DirectionsResult> {
  const params = new URLSearchParams({
    origin_lat: String(origin.latitude),
    origin_lng: String(origin.longitude),
    dest_lat: String(destination.latitude),
    dest_lng: String(destination.longitude),
    mode,
    language: 'fr',
  });

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/directions?${params}`, { headers });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? 'Erreur lors du calcul de l\'itinéraire.');
  }

  return json.data as DirectionsResult;
}

/** Maneuver icon name mapping for Ionicons */
export function maneuverToIcon(maneuver: string): string {
  if (maneuver.includes('left')) return 'arrow-back';
  if (maneuver.includes('right')) return 'arrow-forward';
  if (maneuver.includes('uturn')) return 'return-up-back';
  if (maneuver.includes('roundabout')) return 'refresh';
  if (maneuver.includes('merge')) return 'git-merge';
  if (maneuver.includes('ramp') || maneuver.includes('fork')) return 'git-branch';
  return 'arrow-up';
}

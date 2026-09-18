// ─────────────────────────────────────────────────────────────────
// Shared TypeScript models for the backend
// ─────────────────────────────────────────────────────────────────

export interface DBUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBChild {
  id: string;
  userId: string; // Owner (primary parent)
  name: string;
  age: number;
  chipId: string;
  color: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface DBChip {
  id: string;
  serialNumber: string;
  childId?: string;
  userId: string;
  lastLatitude: number;
  lastLongitude: number;
  lastSeenAt: Date;
  batteryLevel: number;
  isOnline: boolean;
  firmwareVersion: string;
}

export interface DBSafeZone {
  id: string;
  childId: string;
  userId: string;
  name: string;
  address: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  type: string;
  isActive: boolean;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  color: string;
  createdAt: Date;
}

export interface DBLocationPoint {
  id: string;
  chipId: string;
  childId: string;
  latitude: number;
  longitude: number;
  speed: number;
  accuracy: number;
  timestamp: Date;
}

export interface DBAlert {
  id: string;
  childId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  latitude: number;
  longitude: number;
  address: string;
  isRead: boolean;
  zoneId?: string;
  createdAt: Date;
}

export interface DBFamilyAccess {
  id: string;
  primaryUserId: string;
  secondaryUserId: string;
  childIds: string[];
  canViewLocation: boolean;
  canReceiveAlerts: boolean;
  createdAt: Date;
}

// ── API Response types ────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ── Socket event types ────────────────────────────────────────────

export interface LocationUpdateEvent {
  chipId: string;
  childId: string;
  latitude: number;
  longitude: number;
  speed: number;
  accuracy: number;
  batteryLevel: number;
  timestamp: string;
}

export interface ZoneAlertEvent {
  alertId: string;
  childId: string;
  childName: string;
  type: 'zone_exit' | 'zone_entry';
  zoneName: string;
  address: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface ChipStatusEvent {
  chipId: string;
  childId: string;
  isOnline: boolean;
  batteryLevel: number;
  timestamp: string;
}

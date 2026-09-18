// ─────────────────────────────────────────────────────────────────
// User & Auth
// ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  avatar?: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  role: 'primary' | 'secondary';
  avatar?: string;
  linkedChildIds: string[];
  notificationsEnabled: boolean;
}

// ─────────────────────────────────────────────────────────────────
// Children & Chips
// ─────────────────────────────────────────────────────────────────

export interface Child {
  id: string;
  name: string;
  age: number;
  avatar?: string;
  chipId: string;
  color: string; // For map marker color
  status: ChildStatus;
  lastSeen: string; // ISO date
  currentLocation: Coordinates;
  currentAddress: string;
  batteryLevel: number; // 0–100
  isOnline: boolean;
}

export type ChildStatus = 'safe' | 'alert' | 'warning' | 'offline';

export interface Chip {
  id: string;
  serialNumber: string;
  name: string;
  childId?: string;
  isPaired: boolean;
  batteryLevel: number;
  lastPing: string;
  firmwareVersion: string;
  signalStrength: number; // 0–100
}

// ─────────────────────────────────────────────────────────────────
// Location & Zones
// ─────────────────────────────────────────────────────────────────

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SafeZone {
  id: string;
  childId: string;
  name: string;
  address: string;
  center: Coordinates;
  radius: number; // meters
  type: SafeZoneType;
  isActive: boolean;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  color: string;
  schedule?: ZoneSchedule;
}

export type SafeZoneType =
  | 'school'
  | 'home'
  | 'family'
  | 'friend'
  | 'activity'
  | 'custom';

export interface ZoneSchedule {
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  startTime: string; // "HH:mm"
  endTime: string;
}

export interface LocationPoint {
  coordinates: Coordinates;
  timestamp: string;
  address?: string;
  speed?: number;
}

// ─────────────────────────────────────────────────────────────────
// Alerts
// ─────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  childId: string;
  childName: string;
  type: AlertType;
  title: string;
  message: string;
  location: Coordinates;
  address: string;
  timestamp: string;
  isRead: boolean;
  zoneId?: string;
  zoneName?: string;
}

export type AlertType =
  | 'zone_exit'
  | 'zone_entry'
  | 'low_battery'
  | 'sos'
  | 'offline'
  | 'unusual_movement'
  | 'safe_return';

// ─────────────────────────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────────────────────────

export type ReportPeriod = 'weekly' | 'monthly' | 'quarterly';

export interface MovementReport {
  id: string;
  childId: string;
  childName: string;
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  totalDistance: number; // km
  totalAlerts: number;
  zonesVisited: ZoneVisit[];
  dailySummaries: DailySummary[];
  generatedAt: string;
}

export interface ZoneVisit {
  zoneId: string;
  zoneName: string;
  visitCount: number;
  totalDuration: number; // minutes
}

export interface DailySummary {
  date: string;
  firstSeen: string;
  lastSeen: string;
  distance: number;
  alertCount: number;
  zonesVisited: string[];
}

// ─────────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────────

export type NavigationMode = 'walking' | 'driving';

export interface RouteInfo {
  mode: NavigationMode;
  distanceKm: number;
  durationMinutes: number;
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distanceM: number;
  coordinates: Coordinates;
}

// ─────────────────────────────────────────────────────────────────
// App Navigation (React Navigation)
// ─────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  HomeTab: undefined;
  ChildrenTab: undefined;
  AlertsTab: undefined;
  ReportsTab: undefined;
  SettingsTab: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  ChildDetail: { childId: string };
  SafeZones: { childId: string };
  NavigateToChild: { childId: string };
  AddChild: undefined;
  PairChip: { childId?: string };
  FamilyMembers: undefined;
  AddFamilyMember: undefined;
  ReportDetail: { reportId: string };
  ZoneEditor: { childId: string; zoneId?: string };
};

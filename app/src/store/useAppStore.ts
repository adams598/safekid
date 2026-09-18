import { create } from 'zustand';
import {
  Alert,
  Child,
  Chip,
  FamilyMember,
  MovementReport,
  SafeZone,
  User,
} from '../types';
import {
  mockAlerts,
  mockChildren,
  mockChips,
  mockFamilyMembers,
  mockReports,
  mockSafeZones,
  mockUser,
} from '../services/mockData';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Children
  children: Child[];
  selectedChildId: string | null;
  setSelectedChild: (childId: string | null) => void;
  updateChildLocation: (childId: string, lat: number, lng: number) => void;
  addChild: (child: Child) => void;
  removeChild: (childId: string) => void;

  // Chips
  chips: Chip[];
  addChip: (chip: Chip) => void;
  pairChip: (chipId: string, childId: string) => void;

  // Safe Zones
  safeZones: SafeZone[];
  addSafeZone: (zone: SafeZone) => void;
  updateSafeZone: (zoneId: string, updates: Partial<SafeZone>) => void;
  deleteSafeZone: (zoneId: string) => void;
  getZonesForChild: (childId: string) => SafeZone[];

  // Alerts
  alerts: Alert[];
  unreadAlertsCount: number;
  markAlertRead: (alertId: string) => void;
  markAllAlertsRead: () => void;
  addAlert: (alert: Alert) => void;

  // Family Members
  familyMembers: FamilyMember[];
  addFamilyMember: (member: FamilyMember) => void;
  removeFamilyMember: (memberId: string) => void;

  // Reports
  reports: MovementReport[];

  // UI State
  isTrackingActive: boolean;
  setTrackingActive: (active: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────────
  isAuthenticated: false,
  user: null,

  login: async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 1000)); // Simulate API call
    if (email) {
      set({ isAuthenticated: true, user: mockUser });
      return true;
    }
    return false;
  },

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      selectedChildId: null,
    }),

  // ── Children ──────────────────────────────────────────────────
  children: mockChildren,
  selectedChildId: null,

  setSelectedChild: (childId) => set({ selectedChildId: childId }),

  updateChildLocation: (childId, lat, lng) =>
    set((state) => ({
      children: state.children.map((c) =>
        c.id === childId
          ? {
              ...c,
              currentLocation: { latitude: lat, longitude: lng },
              lastSeen: new Date().toISOString(),
            }
          : c,
      ),
    })),

  addChild: (child) =>
    set((state) => ({ children: [...state.children, child] })),

  removeChild: (childId) =>
    set((state) => ({
      children: state.children.filter((c) => c.id !== childId),
    })),

  // ── Chips ─────────────────────────────────────────────────────
  chips: mockChips,

  addChip: (chip) =>
    set((state) => ({ chips: [...state.chips, chip] })),

  pairChip: (chipId, childId) =>
    set((state) => ({
      chips: state.chips.map((c) =>
        c.id === chipId ? { ...c, childId, isPaired: true } : c,
      ),
    })),

  // ── Safe Zones ────────────────────────────────────────────────
  safeZones: mockSafeZones,

  addSafeZone: (zone) =>
    set((state) => ({ safeZones: [...state.safeZones, zone] })),

  updateSafeZone: (zoneId, updates) =>
    set((state) => ({
      safeZones: state.safeZones.map((z) =>
        z.id === zoneId ? { ...z, ...updates } : z,
      ),
    })),

  deleteSafeZone: (zoneId) =>
    set((state) => ({
      safeZones: state.safeZones.filter((z) => z.id !== zoneId),
    })),

  getZonesForChild: (childId) =>
    get().safeZones.filter((z) => z.childId === childId),

  // ── Alerts ────────────────────────────────────────────────────
  alerts: mockAlerts,
  unreadAlertsCount: mockAlerts.filter((a) => !a.isRead).length,

  markAlertRead: (alertId) =>
    set((state) => {
      const updated = state.alerts.map((a) =>
        a.id === alertId ? { ...a, isRead: true } : a,
      );
      return {
        alerts: updated,
        unreadAlertsCount: updated.filter((a) => !a.isRead).length,
      };
    }),

  markAllAlertsRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, isRead: true })),
      unreadAlertsCount: 0,
    })),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadAlertsCount: state.unreadAlertsCount + 1,
    })),

  // ── Family Members ────────────────────────────────────────────
  familyMembers: mockFamilyMembers,

  addFamilyMember: (member) =>
    set((state) => ({
      familyMembers: [...state.familyMembers, member],
    })),

  removeFamilyMember: (memberId) =>
    set((state) => ({
      familyMembers: state.familyMembers.filter((m) => m.id !== memberId),
    })),

  // ── Reports ───────────────────────────────────────────────────
  reports: mockReports,

  // ── UI State ──────────────────────────────────────────────────
  isTrackingActive: false,
  setTrackingActive: (active) => set({ isTrackingActive: active }),
}));

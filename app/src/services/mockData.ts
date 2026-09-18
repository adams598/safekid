import { Alert, Child, Chip, FamilyMember, MovementReport, SafeZone, User } from '../types';

// ─────────────────────────────────────────────────────────────────
// Current user
// ─────────────────────────────────────────────────────────────────
export const mockUser: User = {
  id: 'user_001',
  fullName: 'Marie Ngono',
  email: 'marie.ngono@gmail.com',
  phone: '+237 690 123 456',
  country: 'CM',
  createdAt: '2024-01-15T08:00:00Z',
};

// ─────────────────────────────────────────────────────────────────
// Children
// ─────────────────────────────────────────────────────────────────
export const mockChildren: Child[] = [
  {
    id: 'child_001',
    name: 'Lucas',
    age: 8,
    chipId: 'chip_001',
    color: '#5B6EF8',
    status: 'safe',
    lastSeen: new Date().toISOString(),
    currentLocation: { latitude: 3.848, longitude: 11.502 },
    currentAddress: 'École Primaire Bastos, Yaoundé',
    batteryLevel: 87,
    isOnline: true,
  },
  {
    id: 'child_002',
    name: 'Emma',
    age: 11,
    chipId: 'chip_002',
    color: '#34C89A',
    status: 'alert',
    lastSeen: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    currentLocation: { latitude: 3.872, longitude: 11.518 },
    currentAddress: 'Avenue Kennedy, Yaoundé',
    batteryLevel: 32,
    isOnline: true,
  },
];

// ─────────────────────────────────────────────────────────────────
// Chips
// ─────────────────────────────────────────────────────────────────
export const mockChips: Chip[] = [
  {
    id: 'chip_001',
    serialNumber: 'SK-2024-001847',
    name: 'Puce Lucas',
    childId: 'child_001',
    isPaired: true,
    batteryLevel: 87,
    lastPing: new Date().toISOString(),
    firmwareVersion: '2.1.4',
    signalStrength: 92,
  },
  {
    id: 'chip_002',
    serialNumber: 'SK-2024-002391',
    name: 'Puce Emma',
    childId: 'child_002',
    isPaired: true,
    batteryLevel: 32,
    lastPing: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    firmwareVersion: '2.1.4',
    signalStrength: 74,
  },
];

// ─────────────────────────────────────────────────────────────────
// Safe Zones
// ─────────────────────────────────────────────────────────────────
export const mockSafeZones: SafeZone[] = [
  {
    id: 'zone_001',
    childId: 'child_001',
    name: 'Maison',
    address: 'Quartier Bastos, Yaoundé, Cameroun',
    center: { latitude: 3.852, longitude: 11.505 },
    radius: 150,
    type: 'home',
    isActive: true,
    notifyOnEntry: true,
    notifyOnExit: true,
    color: '#5B6EF8',
  },
  {
    id: 'zone_002',
    childId: 'child_001',
    name: 'École Primaire',
    address: 'École Primaire Bastos, Yaoundé',
    center: { latitude: 3.848, longitude: 11.502 },
    radius: 200,
    type: 'school',
    isActive: true,
    notifyOnEntry: true,
    notifyOnExit: true,
    color: '#34C89A',
    schedule: {
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      startTime: '07:00',
      endTime: '17:30',
    },
  },
  {
    id: 'zone_003',
    childId: 'child_001',
    name: 'Chez Grand-mère',
    address: 'Quartier Mvog-Ada, Yaoundé',
    center: { latitude: 3.862, longitude: 11.512 },
    radius: 120,
    type: 'family',
    isActive: true,
    notifyOnEntry: false,
    notifyOnExit: true,
    color: '#FF9F0A',
  },
  {
    id: 'zone_004',
    childId: 'child_002',
    name: 'Maison',
    address: 'Quartier Bastos, Yaoundé, Cameroun',
    center: { latitude: 3.852, longitude: 11.505 },
    radius: 150,
    type: 'home',
    isActive: true,
    notifyOnEntry: true,
    notifyOnExit: true,
    color: '#34C89A',
  },
  {
    id: 'zone_005',
    childId: 'child_002',
    name: 'Collège Bilingue',
    address: 'Collège Bilingue de Yaoundé',
    center: { latitude: 3.868, longitude: 11.510 },
    radius: 250,
    type: 'school',
    isActive: true,
    notifyOnEntry: true,
    notifyOnExit: true,
    color: '#5B6EF8',
    schedule: {
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      startTime: '07:30',
      endTime: '17:00',
    },
  },
];

// ─────────────────────────────────────────────────────────────────
// Alerts
// ─────────────────────────────────────────────────────────────────
export const mockAlerts: Alert[] = [
  {
    id: 'alert_001',
    childId: 'child_002',
    childName: 'Emma',
    type: 'zone_exit',
    title: 'Emma a quitté la zone',
    message: 'Emma a quitté la zone "Collège Bilingue" à 15h42.',
    location: { latitude: 3.872, longitude: 11.518 },
    address: 'Avenue Kennedy, Yaoundé',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    isRead: false,
    zoneId: 'zone_005',
    zoneName: 'Collège Bilingue',
  },
  {
    id: 'alert_002',
    childId: 'child_002',
    childName: 'Emma',
    type: 'low_battery',
    title: 'Batterie faible — Emma',
    message: 'La puce d\'Emma est à 32%. Rechargez-la bientôt.',
    location: { latitude: 3.872, longitude: 11.518 },
    address: 'Avenue Kennedy, Yaoundé',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'alert_003',
    childId: 'child_001',
    childName: 'Lucas',
    type: 'zone_entry',
    title: 'Lucas est arrivé à l\'école',
    message: 'Lucas est entré dans la zone "École Primaire" à 07:55.',
    location: { latitude: 3.848, longitude: 11.502 },
    address: 'École Primaire Bastos, Yaoundé',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    zoneId: 'zone_002',
    zoneName: 'École Primaire',
  },
  {
    id: 'alert_004',
    childId: 'child_001',
    childName: 'Lucas',
    type: 'safe_return',
    title: 'Lucas est rentré à la maison',
    message: 'Lucas est rentré à la maison hier à 16h30.',
    location: { latitude: 3.852, longitude: 11.505 },
    address: 'Quartier Bastos, Yaoundé',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    zoneId: 'zone_001',
    zoneName: 'Maison',
  },
  {
    id: 'alert_005',
    childId: 'child_002',
    childName: 'Emma',
    type: 'zone_exit',
    title: 'Emma a quitté la maison',
    message: 'Emma a quitté la zone "Maison" à 07h15.',
    location: { latitude: 3.855, longitude: 11.507 },
    address: 'Boulevard de la Réunification, Yaoundé',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    zoneId: 'zone_004',
    zoneName: 'Maison',
  },
];

// ─────────────────────────────────────────────────────────────────
// Family Members
// ─────────────────────────────────────────────────────────────────
export const mockFamilyMembers: FamilyMember[] = [
  {
    id: 'family_001',
    userId: 'user_002',
    fullName: 'Paul Ngono',
    phone: '+237 699 456 789',
    email: 'paul.ngono@gmail.com',
    role: 'secondary',
    linkedChildIds: ['child_001', 'child_002'],
    notificationsEnabled: true,
  },
  {
    id: 'family_002',
    userId: 'user_003',
    fullName: 'Madeleine Mbida',
    phone: '+237 677 234 567',
    email: 'madeleine.mbida@gmail.com',
    role: 'secondary',
    linkedChildIds: ['child_001'],
    notificationsEnabled: false,
  },
];

// ─────────────────────────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────────────────────────
export const mockReports: MovementReport[] = [
  {
    id: 'report_001',
    childId: 'child_001',
    childName: 'Lucas',
    period: 'monthly',
    startDate: '2024-08-01',
    endDate: '2024-08-31',
    totalDistance: 47.2,
    totalAlerts: 3,
    zonesVisited: [
      { zoneId: 'zone_001', zoneName: 'Maison', visitCount: 31, totalDuration: 10080 },
      { zoneId: 'zone_002', zoneName: 'École Primaire', visitCount: 22, totalDuration: 3960 },
      { zoneId: 'zone_003', zoneName: 'Chez Grand-mère', visitCount: 4, totalDuration: 720 },
    ],
    dailySummaries: [
      {
        date: '2024-08-26',
        firstSeen: '07:15',
        lastSeen: '19:30',
        distance: 2.1,
        alertCount: 0,
        zonesVisited: ['Maison', 'École Primaire'],
      },
      {
        date: '2024-08-25',
        firstSeen: '07:10',
        lastSeen: '18:45',
        distance: 2.3,
        alertCount: 1,
        zonesVisited: ['Maison', 'École Primaire', 'Chez Grand-mère'],
      },
    ],
    generatedAt: new Date().toISOString(),
  },
  {
    id: 'report_002',
    childId: 'child_002',
    childName: 'Emma',
    period: 'weekly',
    startDate: '2024-08-19',
    endDate: '2024-08-25',
    totalDistance: 12.8,
    totalAlerts: 2,
    zonesVisited: [
      { zoneId: 'zone_004', zoneName: 'Maison', visitCount: 7, totalDuration: 2940 },
      { zoneId: 'zone_005', zoneName: 'Collège Bilingue', visitCount: 5, totalDuration: 1400 },
    ],
    dailySummaries: [
      {
        date: '2024-08-25',
        firstSeen: '07:15',
        lastSeen: '18:30',
        distance: 3.2,
        alertCount: 0,
        zonesVisited: ['Maison', 'Collège Bilingue'],
      },
    ],
    generatedAt: new Date().toISOString(),
  },
];

// ─────────────────────────────────────────────────────────────────
// Location history (trajectory for map)
// ─────────────────────────────────────────────────────────────────
export const mockLocationHistory = {
  child_001: [
    { latitude: 3.852, longitude: 11.505, timestamp: '2024-08-27T07:10:00Z' },
    { latitude: 3.851, longitude: 11.503, timestamp: '2024-08-27T07:20:00Z' },
    { latitude: 3.849, longitude: 11.502, timestamp: '2024-08-27T07:30:00Z' },
    { latitude: 3.848, longitude: 11.502, timestamp: '2024-08-27T07:45:00Z' },
  ],
  child_002: [
    { latitude: 3.852, longitude: 11.505, timestamp: '2024-08-27T07:15:00Z' },
    { latitude: 3.856, longitude: 11.509, timestamp: '2024-08-27T07:25:00Z' },
    { latitude: 3.863, longitude: 11.514, timestamp: '2024-08-27T07:40:00Z' },
    { latitude: 3.872, longitude: 11.518, timestamp: '2024-08-27T07:55:00Z' },
  ],
};

// Countries for registration
export const countries = [
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲', dialCode: '+237' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', dialCode: '+225' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', dialCode: '+221' },
  { code: 'CD', name: 'Congo RDC', flag: '🇨🇩', dialCode: '+243' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', dialCode: '+242' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', dialCode: '+241' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪', dialCode: '+32' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭', dialCode: '+41' },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦', dialCode: '+212' },
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳', dialCode: '+216' },
  { code: 'DZ', name: 'Algérie', flag: '🇩🇿', dialCode: '+213' },
];

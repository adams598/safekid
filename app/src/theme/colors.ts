export const colors = {
  // Primary — Periwinkle blue (trustworthy, calm, safe)
  primary: '#5B6EF8',
  primaryLight: '#EEF0FF',
  primaryDark: '#3D52E0',
  primaryMid: '#8693FB',

  // Secondary — Mint green (safety, life, freshness)
  secondary: '#34C89A',
  secondaryLight: '#E8FAF5',
  secondaryDark: '#1FA87B',

  // Danger — Soft red (alerts, emergencies)
  danger: '#FF5C5C',
  dangerLight: '#FFF0F0',
  dangerDark: '#E03E3E',

  // Warning — Amber
  warning: '#FF9F0A',
  warningLight: '#FFF8E8',

  // Success — Apple green
  success: '#30D158',
  successLight: '#E8FFF0',

  // Backgrounds
  background: '#F6F7FB',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFBFF',
  surfaceDim: '#F0F2F9',

  // Text
  text: '#0F1117',
  textSecondary: '#6B7280',
  textMuted: '#A1A8B4',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  // Borders
  border: '#E8EAF0',
  borderLight: '#F0F2F8',
  borderFocus: '#5B6EF8',

  // Overlay
  overlay: 'rgba(15, 17, 23, 0.55)',
  overlayLight: 'rgba(15, 17, 23, 0.08)',

  // Safe zone colors (for map circles)
  safeZone: 'rgba(52, 200, 154, 0.15)',
  safeZoneBorder: 'rgba(52, 200, 154, 0.6)',

  // Alert zone
  alertZone: 'rgba(255, 92, 92, 0.12)',
  alertZoneBorder: 'rgba(255, 92, 92, 0.5)',

  // Misc
  shimmer: '#E8EAF0',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type Color = keyof typeof colors;

import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: {
    regular: 'SF Pro Display',
    medium: 'SF Pro Display',
    semibold: 'SF Pro Display',
    bold: 'SF Pro Display',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto',
    semibold: 'Roboto',
    bold: 'Roboto',
  },
  default: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
});

export const typography = {
  // Display sizes
  displayLarge: {
    fontSize: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 44,
    fontFamily: fontFamily?.bold,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 36,
    fontFamily: fontFamily?.bold,
  },
  displaySmall: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 32,
    fontFamily: fontFamily?.semibold,
  },

  // Headings
  h1: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
    lineHeight: 30,
    fontFamily: fontFamily?.bold,
  },
  h2: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
    lineHeight: 26,
    fontFamily: fontFamily?.semibold,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 24,
    fontFamily: fontFamily?.semibold,
  },

  // Body
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    lineHeight: 24,
    fontFamily: fontFamily?.regular,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    lineHeight: 22,
    fontFamily: fontFamily?.regular,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
    fontFamily: fontFamily?.regular,
  },

  // Labels
  labelLarge: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    lineHeight: 20,
    fontFamily: fontFamily?.semibold,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.4,
    lineHeight: 18,
    fontFamily: fontFamily?.semibold,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
    fontFamily: fontFamily?.medium,
  },

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.3,
    lineHeight: 18,
    fontFamily: fontFamily?.regular,
  },

  // Button
  buttonLarge: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 24,
    fontFamily: fontFamily?.semibold,
  },
  button: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    lineHeight: 20,
    fontFamily: fontFamily?.semibold,
  },
};

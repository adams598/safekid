import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../theme';

interface BatteryIndicatorProps {
  level: number; // 0–100
  showLabel?: boolean;
  width?: number;
}

export function BatteryIndicator({ level, showLabel = true, width = 24 }: BatteryIndicatorProps) {
  const color =
    level > 50
      ? colors.success
      : level > 20
      ? colors.warning
      : colors.danger;

  const height = 12;
  const fillWidth = (width * Math.min(100, Math.max(0, level))) / 100;

  return (
    <View style={styles.row}>
      <View style={[styles.body, { width, height }]}>
        <View style={[styles.fill, { width: fillWidth, backgroundColor: color }]} />
        <View style={[styles.cap, { height: height * 0.5, backgroundColor: color }]} />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color }]}>{level}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  body: {
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: 1.5,
  },
  cap: {
    width: 3,
    borderRadius: 1,
    backgroundColor: colors.textMuted,
    position: 'absolute',
    right: -4,
    alignSelf: 'center',
  },
  label: {
    ...typography.labelSmall,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { ChildStatus } from '../../types';

type BadgeVariant = 'safe' | 'alert' | 'warning' | 'offline' | 'info' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'default', dot = true, size = 'sm' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], size === 'md' && styles.sizeMd]}>
      {dot && <View style={[styles.dot, styles[`dot_${variant}`]]} />}
      <Text style={[styles.text, styles[`text_${variant}`], size === 'md' && styles.textMd]}>
        {label}
      </Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: ChildStatus }) {
  const config: Record<ChildStatus, { label: string; variant: BadgeVariant }> = {
    safe: { label: 'En sécurité', variant: 'safe' },
    alert: { label: 'Alerte', variant: 'alert' },
    warning: { label: 'Attention', variant: 'warning' },
    offline: { label: 'Hors ligne', variant: 'offline' },
  };

  const { label, variant } = config[status];
  return <Badge label={label} variant={variant} />;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  sizeMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },

  // Variants (background)
  safe: { backgroundColor: colors.successLight },
  alert: { backgroundColor: colors.dangerLight },
  warning: { backgroundColor: colors.warningLight },
  offline: { backgroundColor: colors.surfaceDim },
  info: { backgroundColor: colors.primaryLight },
  default: { backgroundColor: colors.surfaceDim },

  // Dot
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dot_safe: { backgroundColor: colors.success },
  dot_alert: { backgroundColor: colors.danger },
  dot_warning: { backgroundColor: colors.warning },
  dot_offline: { backgroundColor: colors.textMuted },
  dot_info: { backgroundColor: colors.primary },
  dot_default: { backgroundColor: colors.textMuted },

  // Text
  text: {
    ...typography.labelSmall,
  },
  textMd: { ...typography.label },
  text_safe: { color: colors.successDark ?? colors.success },
  text_alert: { color: colors.dangerDark },
  text_warning: { color: colors.warning },
  text_offline: { color: colors.textMuted },
  text_info: { color: colors.primary },
  text_default: { color: colors.textSecondary },
});

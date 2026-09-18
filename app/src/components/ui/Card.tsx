import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View, ViewProps } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  elevated?: boolean;
  padded?: boolean;
  variant?: 'default' | 'alert' | 'success' | 'warning';
}

export function Card({
  children,
  onPress,
  elevated = false,
  padded = true,
  variant = 'default',
  style,
  ...rest
}: CardProps) {
  const content = (
    <View
      style={[
        styles.base,
        elevated && styles.elevated,
        padded && styles.padded,
        variant !== 'default' && styles[variant],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    ...shadow.md,
    borderWidth: 0,
  },
  padded: {
    padding: spacing.base,
  },
  alert: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger + '33',
  },
  success: {
    backgroundColor: colors.successLight,
    borderColor: colors.success + '33',
  },
  warning: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning + '33',
  },
});

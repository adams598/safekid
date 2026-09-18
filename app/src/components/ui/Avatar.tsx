import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../theme';

interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
  imageUri?: string;
}

export function Avatar({ name, size = 44, color = colors.primary, imageUri }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const fontSize = size * 0.38;

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + '20',
          borderColor: color + '40',
        },
      ]}
    >
      <Text style={[styles.text, { fontSize, color }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  image: {
    resizeMode: 'cover',
  },
});

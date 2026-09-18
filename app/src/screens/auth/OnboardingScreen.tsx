import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors, radius, spacing, typography } from '../../theme';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;
};

const slides = [
  {
    id: '1',
    emoji: '📍',
    gradient: [colors.primary, '#7B8FF9'] as [string, string],
    title: 'Localisez en temps réel',
    subtitle:
      "Sachez exactement où se trouve votre enfant à chaque instant, directement depuis votre téléphone.",
  },
  {
    id: '2',
    emoji: '🔔',
    gradient: [colors.secondary, '#5BD4B0'] as [string, string],
    title: 'Alertes instantanées',
    subtitle:
      "Recevez une notification immédiate dès que votre enfant quitte une zone de sécurité définie.",
  },
  {
    id: '3',
    emoji: '👨‍👩‍👧‍👦',
    gradient: ['#FF9F0A', '#FFB84D'] as [string, string],
    title: 'Famille connectée',
    subtitle:
      "Invitez votre conjoint(e) ou la famille à surveiller ensemble. Un enfant, plusieurs gardiens.",
  },
];

export function OnboardingScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleViewableChange = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const goNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableChange}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <LinearGradient
              colors={item.gradient}
              style={styles.illustrationContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
            </LinearGradient>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <Button
          title={activeIndex === slides.length - 1 ? "C'est parti !" : 'Suivant'}
          onPress={goNext}
          fullWidth
          size="lg"
        />

        {activeIndex < slides.length - 1 && (
          <TouchableOpacity
            onPress={() => navigation.replace('Login')}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  illustrationContainer: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 88,
  },
  textContainer: {
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.base,
  },
  title: {
    ...typography.displaySmall,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  bottom: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 48,
    gap: spacing.base,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  skipButton: {
    paddingVertical: spacing.sm,
  },
  skipText: {
    ...typography.body,
    color: colors.textMuted,
  },
});

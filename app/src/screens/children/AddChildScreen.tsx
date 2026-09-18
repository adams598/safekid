import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList, Child } from '../../types';
import { colors, radius, spacing, typography } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const CHILD_COLORS = [
  '#5B6EF8', '#34C89A', '#FF9F0A', '#AF52DE',
  '#FF6B35', '#007AFF', '#FF2D55', '#30D158',
];

const STEPS = ['Enfant', 'Puce', 'Zones'];

export function AddChildScreen() {
  const navigation = useNavigation<Nav>();
  const { addChild } = useAppStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedColor, setSelectedColor] = useState(CHILD_COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Le prénom est requis';
    if (!age.trim() || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 18) {
      e.age = 'Âge entre 1 et 18 ans';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0) {
      if (!validate()) return;
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else {
      // Save child
      const newChild: Child = {
        id: `child_${Date.now()}`,
        name: name.trim(),
        age: Number(age),
        chipId: `chip_new_${Date.now()}`,
        color: selectedColor,
        status: 'safe',
        lastSeen: new Date().toISOString(),
        currentLocation: { latitude: 3.848, longitude: 11.502 },
        currentAddress: 'Position initiale',
        batteryLevel: 100,
        isOnline: false,
      };
      addChild(newChild);
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          if (step === 0) navigation.goBack();
          else setStep(step - 1);
        }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un enfant</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
              {i < step ? (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              ) : (
                <Text style={[styles.stepNumber, i === step && styles.stepNumberActive]}>
                  {i + 1}
                </Text>
              )}
            </View>
            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, i < step && styles.stepLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Informations de l'enfant</Text>
            <Text style={styles.stepSub}>
              Ces informations permettent d'identifier l'enfant dans l'application.
            </Text>

            {/* Avatar preview */}
            <View style={styles.avatarPreview}>
              <Avatar name={name || 'E'} color={selectedColor} size={80} />
            </View>

            <Input
              label="Prénom"
              placeholder="Ex: Lucas, Emma..."
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              error={errors.name}
              leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
            />

            <Input
              label="Âge"
              placeholder="Ex: 8"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
              error={errors.age}
              leftIcon={<Ionicons name="calendar-outline" size={20} color={colors.textMuted} />}
            />

            <View style={styles.colorSection}>
              <Text style={styles.colorLabel}>Couleur de l'enfant</Text>
              <View style={styles.colorRow}>
                {CHILD_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && styles.colorDotSelected]}
                    onPress={() => setSelectedColor(c)}
                  >
                    {selectedColor === c && (
                      <Ionicons name="checkmark" size={14} color={colors.white} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Connecter la puce</Text>
            <Text style={styles.stepSub}>
              Assurez-vous que la puce GPS SafeKid de {name} est chargée et à proximité du téléphone.
            </Text>

            {/* Bluetooth scanning animation */}
            <View style={styles.scanContainer}>
              <View style={styles.scanOuter}>
                <View style={styles.scanMid}>
                  <View style={styles.scanInner}>
                    <Ionicons name="hardware-chip-outline" size={36} color={colors.primary} />
                  </View>
                </View>
              </View>
              <Text style={styles.scanTitle}>Recherche en cours...</Text>
              <Text style={styles.scanSub}>
                Placez la puce à moins de 10cm du téléphone
              </Text>
            </View>

            <View style={styles.chipFoundCard}>
              <View style={styles.chipFoundIcon}>
                <Ionicons name="hardware-chip" size={24} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.chipFoundTitle}>Puce SK-2024-003412 trouvée</Text>
                <Text style={styles.chipFoundSub}>Signal fort · Batterie 100%</Text>
              </View>
              <View style={styles.chipFoundBadge}>
                <Ionicons name="checkmark" size={16} color={colors.secondary} />
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Zones initiales</Text>
            <Text style={styles.stepSub}>
              Ajoutez les zones fréquentées par {name}. Vous pourrez en ajouter d'autres plus tard.
            </Text>

            {[
              { icon: '🏠', name: 'Maison', sub: 'Zone principale' },
              { icon: '🏫', name: 'École', sub: 'Lundi–Vendredi' },
            ].map((zone) => (
              <View key={zone.name} style={styles.zoneRow}>
                <View style={styles.zoneIcon}>
                  <Text style={{ fontSize: 24 }}>{zone.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zoneSub}>{zone.sub}</Text>
                </View>
                <View style={styles.zoneBadge}>
                  <Text style={styles.zoneBadgeText}>À définir</Text>
                </View>
              </View>
            ))}

            <Text style={styles.skipZoneText}>
              Vous pouvez ignorer cette étape et configurer les zones plus tard depuis les paramètres de l'enfant.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={step === STEPS.length - 1 ? 'Terminer' : 'Continuer'}
          onPress={handleNext}
          fullWidth
          size="lg"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h2, color: colors.text, flex: 1, textAlign: 'center' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.base,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepNumber: { ...typography.label, color: colors.textMuted },
  stepNumberActive: { color: colors.white },
  stepLabel: { ...typography.caption, color: colors.textMuted },
  stepLabelActive: { color: colors.primary, fontWeight: '600' },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border },
  stepLineActive: { backgroundColor: colors.primary },
  content: { padding: spacing['2xl'], paddingBottom: 100 },
  stepContent: { gap: spacing.base },
  stepTitle: { ...typography.displaySmall, color: colors.text },
  stepSub: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  avatarPreview: { alignItems: 'center', paddingVertical: spacing.base },
  colorSection: { gap: spacing.sm },
  colorLabel: { ...typography.labelLarge, color: colors.text },
  colorRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: { borderWidth: 3, borderColor: colors.white, transform: [{ scale: 1.15 }] },
  // Scanning
  scanContainer: { alignItems: 'center', paddingVertical: spacing['2xl'], gap: spacing.md },
  scanOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanMid: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  scanTitle: { ...typography.h3, color: colors.text },
  scanSub: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  chipFoundCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.secondaryLight,
    borderRadius: radius.xl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.secondary + '40',
  },
  chipFoundIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipFoundTitle: { ...typography.h3, color: colors.text },
  chipFoundSub: { ...typography.caption, color: colors.secondary },
  chipFoundBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Zones
  zoneRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  zoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneName: { ...typography.h3, color: colors.text },
  zoneSub: { ...typography.caption, color: colors.textMuted },
  zoneBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.warningLight,
    borderRadius: radius.full,
  },
  zoneBadgeText: { ...typography.labelSmall, color: colors.warning },
  skipZoneText: { ...typography.caption, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing['2xl'],
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors, radius, spacing, typography } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppStore } from '../../store/useAppStore';
import { countries } from '../../services/mockData';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export function RegisterScreen({ navigation }: Props) {
  const login = useAppStore((s) => s.login);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Nom requis';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Email invalide';
    if (!phone.trim() || phone.length < 8) newErrors.phone = 'Numéro invalide';
    if (password.length < 6) newErrors.password = 'Minimum 6 caractères';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>
          Protégez vos enfants dès aujourd'hui
        </Text>

        <View style={styles.form}>
          <Input
            label="Nom complet"
            placeholder="Marie Ngono"
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
          />

          <Input
            label="Adresse email"
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />}
          />

          {/* Country + Phone */}
          <View style={styles.phoneRow}>
            <TouchableOpacity
              style={styles.countryButton}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={styles.flag}>{selectedCountry.flag}</Text>
              <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.phoneInputWrapper}>
              <Input
                placeholder="690 123 456"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                error={errors.phone}
              />
            </View>
          </View>

          <Input
            label="Mot de passe"
            placeholder="Minimum 6 caractères"
            secure
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
          />

          <Button
            title="Créer mon compte"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
          />

          <Text style={styles.legal}>
            En créant un compte, vous acceptez nos{' '}
            <Text style={styles.legalLink}>Conditions d'utilisation</Text> et notre{' '}
            <Text style={styles.legalLink}>Politique de confidentialité</Text>.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choisir un pays</Text>
            <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {countries.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={[
                  styles.countryItem,
                  selectedCountry.code === country.code && styles.countryItemSelected,
                ]}
                onPress={() => {
                  setSelectedCountry(country);
                  setShowCountryPicker(false);
                }}
              >
                <Text style={styles.countryFlag}>{country.flag}</Text>
                <Text style={styles.countryName}>{country.name}</Text>
                <Text style={styles.countryDial}>{country.dialCode}</Text>
                {selectedCountry.code === country.code && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { ...typography.displaySmall, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing['2xl'] },
  form: { gap: spacing.base },
  phoneRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: 4,
  },
  flag: { fontSize: 20 },
  dialCode: { ...typography.body, color: colors.text },
  phoneInputWrapper: { flex: 1 },
  legal: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: { color: colors.primary },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing['2xl'],
  },
  footerText: { ...typography.body, color: colors.textSecondary },
  footerLink: { ...typography.labelLarge, color: colors.primary },
  // Modal
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { ...typography.h2, color: colors.text },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    paddingHorizontal: spacing['2xl'],
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  countryItemSelected: { backgroundColor: colors.primaryLight },
  countryFlag: { fontSize: 24, width: 32 },
  countryName: { ...typography.bodyLarge, color: colors.text, flex: 1 },
  countryDial: { ...typography.body, color: colors.textMuted },
});

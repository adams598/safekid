import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types';
import { colors, radius, spacing, typography } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout, children, chips, familyMembers } = useAppStore();

  const sections = [
    {
      title: 'Famille',
      items: [
        {
          icon: 'people-outline',
          color: colors.primary,
          label: 'Membres de la famille',
          sub: `${familyMembers.length} membre${familyMembers.length > 1 ? 's' : ''}`,
          onPress: () => navigation.navigate('FamilyMembers'),
        },
        {
          icon: 'person-add-outline',
          color: colors.secondary,
          label: 'Mes enfants',
          sub: `${children.length} enfant${children.length > 1 ? 's' : ''}`,
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Puces GPS',
      items: [
        {
          icon: 'hardware-chip-outline',
          color: '#AF52DE',
          label: 'Mes puces',
          sub: `${chips.length} puce${chips.length > 1 ? 's' : ''} connectée${chips.length > 1 ? 's' : ''}`,
          onPress: () => navigation.navigate('PairChip', {}),
        },
        {
          icon: 'bluetooth-outline',
          color: '#007AFF',
          label: 'Appairer une puce',
          sub: 'Connecter une nouvelle puce',
          onPress: () => navigation.navigate('PairChip', {}),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications-outline',
          color: colors.warning,
          label: 'Alertes de zone',
          sub: 'Activées',
          toggle: true,
          value: true,
        },
        {
          icon: 'battery-half-outline',
          color: colors.danger,
          label: 'Batterie faible',
          sub: 'Alert sous 20%',
          toggle: true,
          value: true,
        },
        {
          icon: 'cloud-offline-outline',
          color: colors.textMuted,
          label: 'Puce hors ligne',
          sub: 'Si pas de signal',
          toggle: true,
          value: false,
        },
      ],
    },
    {
      title: 'Sécurité',
      items: [
        {
          icon: 'finger-print-outline',
          color: colors.text,
          label: 'Biométrie',
          sub: 'Face ID / Empreinte',
          toggle: true,
          value: true,
        },
        {
          icon: 'lock-closed-outline',
          color: colors.primary,
          label: 'Changer le mot de passe',
          onPress: () => {},
        },
        {
          icon: 'shield-checkmark-outline',
          color: colors.secondary,
          label: 'Confidentialité des données',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Application',
      items: [
        {
          icon: 'language-outline',
          color: colors.primary,
          label: 'Langue',
          sub: 'Français',
          onPress: () => {},
        },
        {
          icon: 'help-circle-outline',
          color: '#34C6CD',
          label: 'Aide & Support',
          onPress: () => {},
        },
        {
          icon: 'document-text-outline',
          color: colors.textMuted,
          label: 'Conditions d\'utilisation',
          onPress: () => {},
        },
        {
          icon: 'information-circle-outline',
          color: colors.textMuted,
          label: 'Version 1.0.0',
          sub: 'SafeKid App',
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paramètres</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile Card */}
        <Card elevated style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar name={user?.fullName ?? 'Utilisateur'} size={56} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.fullName}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Text style={styles.profilePhone}>{user?.phone}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Children quick cards */}
        <View style={styles.childrenRow}>
          {children.map((child) => (
            <TouchableOpacity key={child.id} style={styles.childChip}>
              <View style={[styles.childDot, { backgroundColor: child.color }]} />
              <Text style={styles.childChipName}>{child.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.childChip, styles.addChip]}
            onPress={() => navigation.navigate('AddChild')}
          >
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={[styles.childChipName, { color: colors.primary }]}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, i) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    style={styles.settingRow}
                    onPress={item.onPress}
                    disabled={!item.onPress && !item.toggle}
                    activeOpacity={item.onPress ? 0.7 : 1}
                  >
                    <View style={[styles.settingIcon, { backgroundColor: (item.color ?? colors.primary) + '15' }]}>
                      <Ionicons name={item.icon as any} size={20} color={item.color ?? colors.primary} />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      {item.sub && <Text style={styles.settingSub}>{item.sub}</Text>}
                    </View>
                    {item.toggle !== undefined ? (
                      <Switch
                        value={item.value}
                        trackColor={{ false: colors.border, true: colors.secondary }}
                        thumbColor={colors.white}
                        style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                      />
                    ) : item.onPress ? (
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    ) : null}
                  </TouchableOpacity>
                  {i < section.items.length - 1 && (
                    <View style={styles.itemDivider} />
                  )}
                </React.Fragment>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 56,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h1, color: colors.text },
  scroll: { padding: spacing.base, gap: spacing.base, paddingBottom: 40 },
  profileCard: { padding: spacing.base },
  profileRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { ...typography.h3, color: colors.text },
  profileEmail: { ...typography.body, color: colors.textSecondary },
  profilePhone: { ...typography.caption, color: colors.textMuted },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childrenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  childDot: { width: 10, height: 10, borderRadius: 5 },
  childChipName: { ...typography.label, color: colors.text },
  addChip: { borderStyle: 'dashed', borderColor: colors.primary, backgroundColor: colors.primaryLight },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 2 },
  sectionCard: { padding: 0, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  settingIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: { ...typography.bodyLarge, color: colors.text },
  settingSub: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
  itemDivider: { height: 1, backgroundColor: colors.borderLight, marginLeft: 72 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.base,
    borderRadius: radius.xl,
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger + '30',
  },
  logoutText: { ...typography.buttonLarge, color: colors.danger },
});

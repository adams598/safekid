import React from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, AlertType, AppStackParamList } from '../../types';
import { colors, radius, spacing, typography } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Nav = NativeStackNavigationProp<AppStackParamList>;

function groupAlertsByDate(alerts: Alert[]) {
  const groups: Record<string, Alert[]> = {};
  alerts.forEach((alert) => {
    const date = new Date(alert.timestamp);
    let key: string;
    if (isToday(date)) key = "Aujourd'hui";
    else if (isYesterday(date)) key = 'Hier';
    else key = format(date, 'dd MMMM yyyy', { locale: fr });
    if (!groups[key]) groups[key] = [];
    groups[key].push(alert);
  });
  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

const alertConfig: Record<AlertType, { icon: string; color: string; bg: string }> = {
  zone_exit: { icon: 'exit-outline', color: colors.danger, bg: colors.dangerLight },
  zone_entry: { icon: 'enter-outline', color: colors.success, bg: colors.successLight },
  low_battery: { icon: 'battery-half-outline', color: colors.warning, bg: colors.warningLight },
  sos: { icon: 'warning', color: colors.danger, bg: colors.dangerLight },
  offline: { icon: 'cloud-offline-outline', color: colors.textMuted, bg: colors.surfaceDim },
  unusual_movement: { icon: 'footsteps-outline', color: colors.warning, bg: colors.warningLight },
  safe_return: { icon: 'home-outline', color: colors.success, bg: colors.successLight },
};

export function AlertsScreen() {
  const navigation = useNavigation<Nav>();
  const { alerts, markAlertRead, markAllAlertsRead, unreadAlertsCount, children } = useAppStore();

  const sections = groupAlertsByDate([...alerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  ));

  const renderAlert = ({ item }: { item: Alert }) => {
    const config = alertConfig[item.type];
    const child = children.find((c) => c.id === item.childId);

    return (
      <TouchableOpacity
        style={[styles.alertItem, !item.isRead && styles.alertItemUnread]}
        onPress={() => {
          markAlertRead(item.id);
          if (child) navigation.navigate('ChildDetail', { childId: item.childId });
        }}
        activeOpacity={0.75}
      >
        {/* Icon */}
        <View style={[styles.alertIcon, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon as any} size={22} color={config.color} />
        </View>

        {/* Content */}
        <View style={styles.alertContent}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertTitle} numberOfLines={1}>{item.title}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.alertMessage} numberOfLines={2}>{item.message}</Text>
          <View style={styles.alertMeta}>
            <Ionicons name="location-outline" size={12} color={colors.textMuted} />
            <Text style={styles.alertAddress} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>

        {/* Time */}
        <Text style={styles.alertTime}>
          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: false, locale: fr })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alertes</Text>
        {unreadAlertsCount > 0 && (
          <TouchableOpacity onPress={markAllAlertsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Tout marquer lu</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread count */}
      {unreadAlertsCount > 0 && (
        <View style={styles.unreadBanner}>
          <Ionicons name="notifications" size={18} color={colors.danger} />
          <Text style={styles.unreadBannerText}>
            {unreadAlertsCount} alerte{unreadAlertsCount > 1 ? 's' : ''} non lue{unreadAlertsCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={styles.emptyTitle}>Aucune alerte</Text>
          <Text style={styles.emptyText}>
            Tout va bien ! Les alertes apparaîtront ici dès qu'un événement se produit.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderAlert}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h1, color: colors.text },
  markAllButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
  },
  markAllText: { ...typography.label, color: colors.primary },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.danger + '20',
  },
  unreadBannerText: { ...typography.label, color: colors.danger },
  list: { paddingBottom: 40 },
  sectionHeader: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  sectionTitle: { ...typography.labelLarge, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  alertItem: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    alignItems: 'flex-start',
  },
  alertItemUnread: {
    backgroundColor: colors.surfaceElevated,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  alertContent: { flex: 1, gap: 3 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  alertTitle: { ...typography.h3, color: colors.text, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  alertMessage: { ...typography.body, color: colors.textSecondary, lineHeight: 20 },
  alertMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  alertAddress: { ...typography.caption, color: colors.textMuted, flex: 1 },
  alertTime: { ...typography.caption, color: colors.textMuted, flexShrink: 0, marginTop: 2 },
  separator: { height: 1, backgroundColor: colors.borderLight, marginLeft: 80 },
  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.base, padding: spacing['2xl'] },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { ...typography.h2, color: colors.text },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});

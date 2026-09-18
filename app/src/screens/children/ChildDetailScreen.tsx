import React, { useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/Badge';
import { BatteryIndicator } from '../../components/ui/BatteryIndicator';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { mockLocationHistory } from '../../services/mockData';

type Route = RouteProp<AppStackParamList, 'ChildDetail'>;
type Nav = NativeStackNavigationProp<AppStackParamList>;

export function ChildDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { childId } = route.params;
  const { children, safeZones } = useAppStore();
  const child = children.find((c) => c.id === childId);
  const childZones = safeZones.filter((z) => z.childId === childId);
  const locationHistory = mockLocationHistory[childId as keyof typeof mockLocationHistory] ?? [];

  if (!child) return null;

  const statusColors = {
    safe: colors.success,
    alert: colors.danger,
    warning: colors.warning,
    offline: colors.textMuted,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{child.name}</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map */}
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: child.currentLocation.latitude,
            longitude: child.currentLocation.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          customMapStyle={mapStyleLight}
        >
          {childZones.map((zone) => (
            <Circle
              key={zone.id}
              center={zone.center}
              radius={zone.radius}
              fillColor={colors.safeZone}
              strokeColor={colors.safeZoneBorder}
              strokeWidth={1.5}
            />
          ))}
          <Marker coordinate={child.currentLocation}>
            <View style={[styles.markerOuter, { borderColor: child.color + '40' }]}>
              <View style={[styles.markerInner, { backgroundColor: child.color }]}>
                <Text style={styles.markerText}>{child.name[0]}</Text>
              </View>
            </View>
          </Marker>
        </MapView>

        {/* Child Info Card */}
        <View style={styles.content}>
          <Card elevated style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Avatar name={child.name} color={child.color} size={60} />
              <View style={styles.infoText}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childAge}>{child.age} ans</Text>
                <StatusBadge status={child.status} />
              </View>
              <View style={styles.chipInfo}>
                <BatteryIndicator level={child.batteryLevel} width={28} />
                <View style={[styles.onlineDot, { backgroundColor: child.isOnline ? colors.success : colors.textMuted }]} />
                <Text style={styles.onlineText}>{child.isOnline ? 'En ligne' : 'Hors ligne'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Location */}
            <View style={styles.locationRow}>
              <View style={[styles.locationIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="location" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationLabel}>Position actuelle</Text>
                <Text style={styles.locationAddress} numberOfLines={2}>
                  {child.currentAddress}
                </Text>
              </View>
              <Text style={styles.locationTime}>
                {formatDistanceToNow(new Date(child.lastSeen), { addSuffix: true, locale: fr })}
              </Text>
            </View>
          </Card>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <Button
              title="Rejoindre"
              variant="primary"
              size="md"
              icon={<Ionicons name="navigate" size={18} color={colors.white} />}
              onPress={() => navigation.navigate('NavigateToChild', { childId })}
              style={styles.actionBtn}
            />
            <Button
              title="Zones"
              variant="outline"
              size="md"
              icon={<Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />}
              onPress={() => navigation.navigate('SafeZones', { childId })}
              style={styles.actionBtn}
            />
          </View>

          {/* Stats */}
          <Card style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Aujourd'hui</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2.1 km</Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>07:10</Text>
                <Text style={styles.statLabel}>Départ</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {child.status === 'safe' ? '✓' : '⚠'}
                </Text>
                <Text style={styles.statLabel}>Statut</Text>
              </View>
            </View>
          </Card>

          {/* Safe Zones */}
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Zones de sécurité</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('SafeZones', { childId })}
              >
                <Text style={styles.seeAll}>Gérer</Text>
              </TouchableOpacity>
            </View>
            {childZones.map((zone) => (
              <Card key={zone.id} style={styles.zoneCard}>
                <View style={styles.zoneRow}>
                  <View style={[styles.zoneIcon, { backgroundColor: zone.color + '20' }]}>
                    <Text style={styles.zoneEmoji}>{zoneEmoji(zone.type)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.zoneName}>{zone.name}</Text>
                    <Text style={styles.zoneAddress} numberOfLines={1}>{zone.address}</Text>
                  </View>
                  <View style={[styles.zoneActive, { backgroundColor: zone.isActive ? colors.successLight : colors.surfaceDim }]}>
                    <Text style={[styles.zoneActiveText, { color: zone.isActive ? colors.success : colors.textMuted }]}>
                      {zone.isActive ? 'Actif' : 'Inactif'}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>

          {/* Trajectory */}
          {locationHistory.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Trajet du jour</Text>
              <Card style={styles.trajectoryCard}>
                {locationHistory.map((point, i) => (
                  <View key={i} style={styles.trajectoryItem}>
                    <View style={styles.trajectoryDot}>
                      <View style={[styles.dot, { backgroundColor: i === locationHistory.length - 1 ? colors.primary : colors.border }]} />
                      {i < locationHistory.length - 1 && <View style={styles.dotLine} />}
                    </View>
                    <View style={styles.trajectoryInfo}>
                      <Text style={styles.trajectoryTime}>
                        {format(new Date(point.timestamp), 'HH:mm', { locale: fr })}
                      </Text>
                      <Text style={styles.trajectoryCoords}>
                        {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function zoneEmoji(type: string): string {
  const map: Record<string, string> = {
    school: '🏫',
    home: '🏠',
    family: '👨‍👩‍👧',
    friend: '👫',
    activity: '⚽',
    custom: '📍',
  };
  return map[type] ?? '📍';
}

const mapStyleLight = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f7' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4a4a4a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e9f6' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.h2, color: colors.text, flex: 1, textAlign: 'center' },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: { height: 200 },
  content: { padding: spacing.base, gap: spacing.base },
  infoCard: { gap: spacing.md },
  infoRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  infoText: { flex: 1, gap: spacing.xs },
  childName: { ...typography.h2, color: colors.text },
  childAge: { ...typography.body, color: colors.textSecondary },
  chipInfo: { alignItems: 'flex-end', gap: spacing.xs },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  onlineText: { ...typography.caption, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.borderLight },
  locationRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  locationIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  locationLabel: { ...typography.caption, color: colors.textMuted, marginBottom: 2 },
  locationAddress: { ...typography.body, color: colors.text, flex: 1 },
  locationTime: { ...typography.caption, color: colors.textMuted },
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  actionBtn: { flex: 1 },
  statsCard: { gap: spacing.base },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: spacing.xs },
  statValue: { ...typography.h2, color: colors.text },
  statLabel: { ...typography.caption, color: colors.textMuted },
  statDivider: { width: 1, height: 40, backgroundColor: colors.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  seeAll: { ...typography.label, color: colors.primary },
  zoneCard: { marginBottom: spacing.sm, padding: spacing.md },
  zoneRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  zoneIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  zoneEmoji: { fontSize: 20 },
  zoneName: { ...typography.labelLarge, color: colors.text },
  zoneAddress: { ...typography.caption, color: colors.textMuted },
  zoneActive: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  zoneActiveText: { ...typography.labelSmall },
  trajectoryCard: { padding: spacing.base },
  trajectoryItem: { flexDirection: 'row', gap: spacing.md },
  trajectoryDot: { width: 20, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 2, marginBottom: 2 },
  trajectoryInfo: { flex: 1, paddingBottom: spacing.base },
  trajectoryTime: { ...typography.labelLarge, color: colors.text },
  trajectoryCoords: { ...typography.caption, color: colors.textMuted },
  markerOuter: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  markerInner: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  markerText: { ...typography.h3, color: colors.white },
});

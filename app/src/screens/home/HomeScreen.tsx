import React, { useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Callout, Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/Badge';
import { BatteryIndicator } from '../../components/ui/BatteryIndicator';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_PEEK = 220;

type Nav = NativeStackNavigationProp<AppStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { children, safeZones, unreadAlertsCount } = useAppStore();
  const mapRef = useRef<MapView>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const focusChild = (childId: string) => {
    const child = children.find((c) => c.id === childId);
    if (!child) return;
    setSelectedChildId(childId);
    mapRef.current?.animateToRegion(
      {
        latitude: child.currentLocation.latitude,
        longitude: child.currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      600,
    );
  };

  const initialRegion = {
    latitude: children[0]?.currentLocation.latitude ?? 3.848,
    longitude: children[0]?.currentLocation.longitude ?? 11.502,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        customMapStyle={mapStyle}
      >
        {/* Safe Zone Circles */}
        {safeZones.map((zone) => (
          <Circle
            key={zone.id}
            center={zone.center}
            radius={zone.radius}
            fillColor={colors.safeZone}
            strokeColor={colors.safeZoneBorder}
            strokeWidth={1.5}
          />
        ))}

        {/* Child Markers */}
        {children.map((child) => (
          <Marker
            key={child.id}
            coordinate={child.currentLocation}
            onPress={() => focusChild(child.id)}
          >
            <View style={[
              styles.markerContainer,
              selectedChildId === child.id && styles.markerSelected,
              child.status === 'alert' && styles.markerAlert,
            ]}>
              <View style={[styles.markerInner, { backgroundColor: child.color }]}>
                <Text style={styles.markerInitial}>
                  {child.name[0].toUpperCase()}
                </Text>
              </View>
              {child.status === 'alert' && (
                <View style={styles.alertPulse} />
              )}
            </View>
            <View style={[styles.markerTail, { borderTopColor: child.status === 'alert' ? colors.danger : child.color }]} />
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutName}>{child.name}</Text>
                <Text style={styles.calloutAddress} numberOfLines={2}>
                  {child.currentAddress}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.topBarTitle}>SafeKid</Text>
          <Text style={styles.topBarSubtitle}>{children.length} enfant{children.length > 1 ? 's' : ''} suivi{children.length > 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.alertButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'AlertsTab' } as any)}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          {unreadAlertsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadAlertsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* My location button */}
      <TouchableOpacity style={styles.locationButton}>
        <Ionicons name="locate" size={22} color={colors.primary} />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />

        {selectedChild ? (
          // Selected child detail card
          <View style={styles.selectedChildCard}>
            <View style={styles.selectedChildHeader}>
              <Avatar name={selectedChild.name} color={selectedChild.color} size={48} />
              <View style={styles.selectedChildInfo}>
                <Text style={styles.selectedChildName}>{selectedChild.name}</Text>
                <Text style={styles.selectedChildAddress} numberOfLines={1}>
                  {selectedChild.currentAddress}
                </Text>
                <View style={styles.selectedChildMeta}>
                  <StatusBadge status={selectedChild.status} />
                  <BatteryIndicator level={selectedChild.batteryLevel} />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedChildId(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('ChildDetail', { childId: selectedChild.id })}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="location" size={20} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>Détails</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('SafeZones', { childId: selectedChild.id })}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.secondaryLight }]}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.secondary} />
                </View>
                <Text style={styles.actionLabel}>Zones</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('NavigateToChild', { childId: selectedChild.id })}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.warningLight }]}>
                  <Ionicons name="navigate" size={20} color={colors.warning} />
                </View>
                <Text style={styles.actionLabel}>Rejoindre</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Children list
          <>
            <Text style={styles.sheetTitle}>Mes enfants</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.childrenScroll}
            >
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={styles.childCard}
                  onPress={() => focusChild(child.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.childCardTop}>
                    <Avatar name={child.name} color={child.color} size={40} />
                    {child.status === 'alert' && (
                      <View style={styles.alertDot} />
                    )}
                  </View>
                  <Text style={styles.childCardName}>{child.name}</Text>
                  <Text style={styles.childCardTime}>
                    {formatDistanceToNow(new Date(child.lastSeen), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </Text>
                  <StatusBadge status={child.status} />
                </TouchableOpacity>
              ))}

              {/* Add child button */}
              <TouchableOpacity
                style={styles.addChildButton}
                onPress={() => navigation.navigate('AddChild')}
              >
                <View style={styles.addChildIcon}>
                  <Ionicons name="add" size={28} color={colors.primary} />
                </View>
                <Text style={styles.addChildText}>Ajouter</Text>
              </TouchableOpacity>
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
}

// Soft, clean map style
const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f7' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4a4a4a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e9f6' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e8f5e9' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1 },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: 'rgba(255,255,255,0.92)',
    ...shadow.sm,
  },
  topBarLeft: {},
  topBarTitle: { ...typography.h2, color: colors.primary },
  topBarSubtitle: { ...typography.caption, color: colors.textMuted },
  alertButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: { ...typography.labelSmall, color: colors.white, fontSize: 10 },

  // Location button
  locationButton: {
    position: 'absolute',
    right: spacing.base,
    bottom: SHEET_PEEK + spacing.base,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },

  // Markers
  markerContainer: {
    alignItems: 'center',
  },
  markerSelected: {
    transform: [{ scale: 1.2 }],
  },
  markerAlert: {},
  markerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...shadow.md,
  },
  markerInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  alertPulse: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.danger + '30',
    top: -6,
    left: -6,
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  callout: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    minWidth: 160,
    ...shadow.md,
  },
  calloutName: { ...typography.h3, color: colors.text, marginBottom: 4 },
  calloutAddress: { ...typography.caption, color: colors.textSecondary },

  // Bottom Sheet
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingBottom: 32,
    ...shadow.lg,
    minHeight: SHEET_PEEK,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.h3,
    color: colors.text,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  childrenScroll: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
    paddingRight: spacing.base,
  },
  childCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.base,
    width: 120,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  childCardTop: { position: 'relative' },
  alertDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.white,
  },
  childCardName: { ...typography.h3, color: colors.text, textAlign: 'center' },
  childCardTime: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },

  addChildButton: {
    width: 120,
    borderRadius: radius.xl,
    padding: spacing.base,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    minHeight: 140,
  },
  addChildIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChildText: { ...typography.label, color: colors.primary },

  // Selected child card
  selectedChildCard: { paddingHorizontal: spacing.base, gap: spacing.base },
  selectedChildHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  selectedChildInfo: { flex: 1, gap: spacing.xs },
  selectedChildName: { ...typography.h2, color: colors.text },
  selectedChildAddress: { ...typography.caption, color: colors.textMuted },
  selectedChildMeta: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: { flex: 1, alignItems: 'center', gap: spacing.sm },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { ...typography.caption, color: colors.textSecondary },
});

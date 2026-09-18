import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AppStackParamList, NavigationMode } from '../../types';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../../components/ui/Avatar';

type Route = RouteProp<AppStackParamList, 'NavigateToChild'>;
const { height } = Dimensions.get('window');

// Simulated route coordinates between parent and child
function generateRoute(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number },
  steps = 8,
): { latitude: number; longitude: number }[] {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const jitter = (Math.random() - 0.5) * 0.003 * Math.sin(Math.PI * t);
    points.push({
      latitude: start.latitude + (end.latitude - start.latitude) * t + jitter,
      longitude: start.longitude + (end.longitude - start.longitude) * t + jitter,
    });
  }
  return points;
}

function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

export function NavigateToChildScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { childId } = route.params;
  const { children } = useAppStore();
  const child = children.find((c) => c.id === childId);
  const [mode, setMode] = useState<NavigationMode>('driving');

  if (!child) return null;

  // Simulated parent location (slightly offset from child)
  const parentLocation = {
    latitude: child.currentLocation.latitude - 0.022,
    longitude: child.currentLocation.longitude - 0.018,
  };

  const distanceKm = haversineKm(parentLocation, child.currentLocation);
  const walkMinutes = Math.round((distanceKm / 5) * 60); // ~5 km/h
  const driveMinutes = Math.round((distanceKm / 30) * 60); // ~30 km/h in city
  const currentMinutes = mode === 'walking' ? walkMinutes : driveMinutes;

  const routePoints = generateRoute(parentLocation, child.currentLocation);

  const midLat = (parentLocation.latitude + child.currentLocation.latitude) / 2;
  const midLng = (parentLocation.longitude + child.currentLocation.longitude) / 2;

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: Math.abs(child.currentLocation.latitude - parentLocation.latitude) * 2.2,
          longitudeDelta: Math.abs(child.currentLocation.longitude - parentLocation.longitude) * 2.2,
        }}
        customMapStyle={mapStyleNav}
      >
        {/* Route line */}
        <Polyline
          coordinates={routePoints}
          strokeColor={colors.primary}
          strokeWidth={5}
          lineDashPattern={[0]}
          lineJoin="round"
        />

        {/* Parent marker */}
        <Marker coordinate={parentLocation}>
          <View style={styles.parentMarker}>
            <Ionicons name="person" size={18} color={colors.white} />
          </View>
        </Marker>

        {/* Child marker */}
        <Marker coordinate={child.currentLocation}>
          <View style={[styles.childMarker, { backgroundColor: child.color }]}>
            <Text style={styles.childMarkerText}>{child.name[0]}</Text>
          </View>
        </Marker>
      </MapView>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      {/* Bottom Panel */}
      <View style={styles.panel}>
        <View style={styles.panelHandle} />

        {/* Child info */}
        <View style={styles.childRow}>
          <Avatar name={child.name} color={child.color} size={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.destinationLabel}>Destination</Text>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childAddress} numberOfLines={1}>{child.currentAddress}</Text>
          </View>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN DIRECT</Text>
          </View>
        </View>

        {/* Mode selector */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'driving' && styles.modeButtonActive]}
            onPress={() => setMode('driving')}
          >
            <Ionicons
              name="car"
              size={20}
              color={mode === 'driving' ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.modeLabel, mode === 'driving' && styles.modeLabelActive]}>
              Voiture
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, mode === 'walking' && styles.modeButtonActive]}
            onPress={() => setMode('walking')}
          >
            <Ionicons
              name="walk"
              size={20}
              color={mode === 'walking' ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.modeLabel, mode === 'walking' && styles.modeLabelActive]}>
              À pied
            </Text>
          </TouchableOpacity>
        </View>

        {/* Route info */}
        <View style={styles.routeInfo}>
          <View style={styles.routeInfoItem}>
            <Text style={styles.routeValue}>{distanceKm.toFixed(1)} km</Text>
            <Text style={styles.routeLabel}>Distance</Text>
          </View>
          <View style={styles.routeInfoDivider} />
          <View style={styles.routeInfoItem}>
            <Text style={styles.routeValue}>{currentMinutes} min</Text>
            <Text style={styles.routeLabel}>Temps estimé</Text>
          </View>
          <View style={styles.routeInfoDivider} />
          <View style={styles.routeInfoItem}>
            <Text style={[styles.routeValue, { color: colors.success }]}>Live</Text>
            <Text style={styles.routeLabel}>Mise à jour</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionCard}>
          <View style={styles.instructionIcon}>
            <Ionicons name="arrow-up" size={22} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.instructionText}>Continuez tout droit</Text>
            <Text style={styles.instructionDistance}>
              pendant {Math.round(distanceKm * 400)}m
            </Text>
          </View>
        </View>

        {/* Start / Stop button */}
        <TouchableOpacity style={styles.startButton} activeOpacity={0.85}>
          <Ionicons name="navigate" size={22} color={colors.white} />
          <Text style={styles.startButtonText}>Démarrer la navigation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const mapStyleNav = [
  { elementType: 'geometry', stylers: [{ color: '#f0f0f5' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4a4a4a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e8e8f0' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e9f6' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 56,
    left: spacing.base,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
  parentMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...shadow.md,
  },
  childMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...shadow.md,
  },
  childMarkerText: { ...typography.h3, color: colors.white },
  panel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.base,
    paddingBottom: 40,
    gap: spacing.md,
    ...shadow.lg,
  },
  panelHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  childRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  destinationLabel: { ...typography.caption, color: colors.textMuted },
  childName: { ...typography.h3, color: colors.text },
  childAddress: { ...typography.caption, color: colors.textSecondary },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.dangerLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.danger },
  liveText: { ...typography.labelSmall, color: colors.danger, fontSize: 10 },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceDim,
  },
  modeButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  modeLabel: { ...typography.labelLarge, color: colors.textMuted },
  modeLabelActive: { color: colors.primary },
  routeInfo: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  routeInfoItem: { flex: 1, alignItems: 'center', gap: 4 },
  routeInfoDivider: { width: 1, backgroundColor: colors.border },
  routeValue: { ...typography.h2, color: colors.text },
  routeLabel: { ...typography.caption, color: colors.textMuted },
  instructionCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instructionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: { ...typography.h3, color: colors.text },
  instructionDistance: { ...typography.body, color: colors.textSecondary },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: spacing.base + 2,
  },
  startButtonText: { ...typography.buttonLarge, color: colors.white },
});

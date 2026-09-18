import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AppStackParamList, NavigationMode } from '../../types';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../../components/ui/Avatar';
import {
  DirectionsResult,
  DirectionsStep,
  getDirections,
  maneuverToIcon,
} from '../../services/directionsService';

type Route = RouteProp<AppStackParamList, 'NavigateToChild'>;

export function NavigateToChildScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { childId } = route.params;
  const { children } = useAppStore();
  const child = children.find((c) => c.id === childId);
  const mapRef = useRef<MapView>(null);

  const [mode, setMode] = useState<NavigationMode>('driving');
  const [parentLocation, setParentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Get parent's real GPS position
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Fallback: offset from child (dev only)
        if (child) {
          setParentLocation({
            latitude: child.currentLocation.latitude - 0.022,
            longitude: child.currentLocation.longitude - 0.018,
          });
        }
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setParentLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, [child]);

  // Fetch directions whenever mode or parent location changes
  const fetchDirections = useCallback(async () => {
    if (!parentLocation || !child) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getDirections(parentLocation, child.currentLocation, mode);
      setDirections(result);
      setCurrentStepIndex(0);

      // Fit map to route bounds
      if (result.bounds) {
        mapRef.current?.fitToCoordinates(
          [result.bounds.northeast, result.bounds.southwest],
          { edgePadding: { top: 80, right: 40, bottom: 320, left: 40 }, animated: true },
        );
      }
    } catch (err: any) {
      setError(err.message ?? 'Impossible de calculer l\'itinéraire.');
    } finally {
      setLoading(false);
    }
  }, [parentLocation, child, mode]);

  useEffect(() => {
    fetchDirections();
  }, [fetchDirections]);

  if (!child) return null;

  const currentStep: DirectionsStep | null = directions?.steps[currentStepIndex] ?? null;

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={!!parentLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        initialRegion={
          child
            ? {
                latitude: child.currentLocation.latitude,
                longitude: child.currentLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : undefined
        }
      >
        {/* Real route polyline */}
        {directions && directions.overviewPolyline.length > 0 && (
          <>
            {/* Shadow line */}
            <Polyline
              coordinates={directions.overviewPolyline}
              strokeColor="rgba(0,0,0,0.12)"
              strokeWidth={8}
              lineJoin="round"
            />
            {/* Main line */}
            <Polyline
              coordinates={directions.overviewPolyline}
              strokeColor={colors.primary}
              strokeWidth={5}
              lineJoin="round"
            />
          </>
        )}

        {/* Parent marker */}
        {parentLocation && (
          <Marker coordinate={parentLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.parentMarker}>
              <Ionicons name="person" size={18} color={colors.white} />
            </View>
          </Marker>
        )}

        {/* Child marker */}
        <Marker coordinate={child.currentLocation} anchor={{ x: 0.5, y: 1 }}>
          <View style={[styles.childMarker, { backgroundColor: child.color }]}>
            <Text style={styles.childMarkerText}>{child.name[0]}</Text>
          </View>
          <View style={[styles.markerTail, { borderTopColor: child.color }]} />
        </Marker>
      </MapView>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      {/* Recenter button */}
      {directions && (
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={() => {
            if (directions.bounds) {
              mapRef.current?.fitToCoordinates(
                [directions.bounds.northeast, directions.bounds.southwest],
                { edgePadding: { top: 80, right: 40, bottom: 320, left: 40 }, animated: true },
              );
            }
          }}
        >
          <Ionicons name="scan-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Bottom Panel */}
      <View style={styles.panel}>
        <View style={styles.panelHandle} />

        {/* Child info */}
        <View style={styles.childRow}>
          <Avatar name={child.name} color={child.color} size={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.destinationLabel}>Destination</Text>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childAddress} numberOfLines={1}>
              {directions?.endAddress ?? child.currentAddress}
            </Text>
          </View>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN DIRECT</Text>
          </View>
        </View>

        {/* Mode selector */}
        <View style={styles.modeRow}>
          {(['driving', 'walking'] as NavigationMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modeButton, mode === m && styles.modeButtonActive]}
              onPress={() => setMode(m)}
              disabled={loading}
            >
              <Ionicons
                name={m === 'driving' ? 'car' : 'walk'}
                size={20}
                color={mode === m ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.modeLabel, mode === m && styles.modeLabelActive]}>
                {m === 'driving' ? 'Voiture' : 'À pied'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Route info or loading/error */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Calcul de l'itinéraire...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchDirections} style={styles.retryButton}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : directions ? (
          <>
            {/* Stats row */}
            <View style={styles.routeInfo}>
              <View style={styles.routeInfoItem}>
                <Text style={styles.routeValue}>{directions.distanceText}</Text>
                <Text style={styles.routeLabel}>Distance</Text>
              </View>
              <View style={styles.routeInfoDivider} />
              <View style={styles.routeInfoItem}>
                <Text style={styles.routeValue}>{directions.durationText}</Text>
                <Text style={styles.routeLabel}>Durée estimée</Text>
              </View>
              <View style={styles.routeInfoDivider} />
              <View style={styles.routeInfoItem}>
                <Text style={[styles.routeValue, { color: colors.success, fontSize: 13 }]}>
                  Temps réel
                </Text>
                <Text style={styles.routeLabel}>Trafic</Text>
              </View>
            </View>

            {/* Current instruction */}
            {currentStep && (
              <View style={styles.instructionCard}>
                <View style={styles.instructionIcon}>
                  <Ionicons
                    name={maneuverToIcon(currentStep.maneuver) as any}
                    size={22}
                    color={colors.white}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.instructionText} numberOfLines={2}>
                    {currentStep.instruction}
                  </Text>
                  <Text style={styles.instructionDistance}>
                    {currentStep.distanceText} · {currentStep.durationText}
                  </Text>
                </View>
                {/* Step counter */}
                <View style={styles.stepCounter}>
                  <Text style={styles.stepCounterText}>
                    {currentStepIndex + 1}/{directions.steps.length}
                  </Text>
                </View>
              </View>
            )}

            {/* Navigation button */}
            {!isNavigating ? (
              <TouchableOpacity
                style={styles.startButton}
                activeOpacity={0.85}
                onPress={() => {
                  setIsNavigating(true);
                  setCurrentStepIndex(0);
                }}
              >
                <Ionicons name="navigate" size={22} color={colors.white} />
                <Text style={styles.startButtonText}>Démarrer la navigation</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.navControls}>
                <TouchableOpacity
                  style={[styles.navButton, currentStepIndex === 0 && styles.navButtonDisabled]}
                  onPress={() => setCurrentStepIndex((i) => Math.max(0, i - 1))}
                  disabled={currentStepIndex === 0}
                >
                  <Ionicons name="arrow-back" size={20} color={currentStepIndex === 0 ? colors.textMuted : colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={() => setIsNavigating(false)}
                >
                  <Ionicons name="stop" size={18} color={colors.danger} />
                  <Text style={styles.stopText}>Arrêter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navButton, currentStepIndex >= directions.steps.length - 1 && styles.navButtonDisabled]}
                  onPress={() => setCurrentStepIndex((i) => Math.min(directions.steps.length - 1, i + 1))}
                  disabled={currentStepIndex >= directions.steps.length - 1}
                >
                  <Ionicons name="arrow-forward" size={20} color={currentStepIndex >= directions.steps.length - 1 ? colors.textMuted : colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            {/* All steps toggle */}
            {isNavigating && (
              <StepsList steps={directions.steps} currentIndex={currentStepIndex} />
            )}
          </>
        ) : null}
      </View>
    </View>
  );
}

function StepsList({
  steps,
  currentIndex,
}: {
  steps: DirectionsStep[];
  currentIndex: number;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View>
      <TouchableOpacity style={styles.stepsToggle} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.stepsToggleText}>
          {expanded ? 'Masquer les étapes' : `Voir toutes les étapes (${steps.length})`}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.primary}
        />
      </TouchableOpacity>
      {expanded && (
        <ScrollView style={styles.stepsList} nestedScrollEnabled>
          {steps.map((step, i) => (
            <View
              key={i}
              style={[styles.stepRow, i === currentIndex && styles.stepRowActive]}
            >
              <View style={[styles.stepIconSmall, i === currentIndex && styles.stepIconActive]}>
                <Ionicons
                  name={maneuverToIcon(step.maneuver) as any}
                  size={14}
                  color={i === currentIndex ? colors.white : colors.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.stepText, i === currentIndex && styles.stepTextActive]}
                  numberOfLines={2}
                >
                  {step.instruction}
                </Text>
                <Text style={styles.stepMeta}>{step.distanceText}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

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
  recenterButton: {
    position: 'absolute',
    top: 56,
    right: spacing.base,
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
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
    marginTop: -1,
  },

  panel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.base,
    paddingBottom: 36,
    gap: spacing.md,
    ...shadow.lg,
    maxHeight: Dimensions.get('window').height * 0.6,
  },
  panelHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
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
  modeButtonActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  modeLabel: { ...typography.labelLarge, color: colors.textMuted },
  modeLabelActive: { color: colors.primary },

  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.base,
  },
  loadingText: { ...typography.body, color: colors.textSecondary },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  errorText: { ...typography.body, color: colors.danger, flex: 1 },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.danger,
    borderRadius: radius.full,
  },
  retryText: { ...typography.label, color: colors.white },

  routeInfo: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.md,
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
    flexShrink: 0,
  },
  instructionText: { ...typography.h3, color: colors.text },
  instructionDistance: { ...typography.body, color: colors.textSecondary },
  stepCounter: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  stepCounterText: { ...typography.labelSmall, color: colors.primary },

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

  navControls: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  navButtonDisabled: { borderColor: colors.border, backgroundColor: colors.surfaceDim },
  stopButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.danger + '40',
  },
  stopText: { ...typography.labelLarge, color: colors.danger },

  stepsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  stepsToggleText: { ...typography.label, color: colors.primary },
  stepsList: { maxHeight: 200 },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  stepRowActive: { backgroundColor: colors.primaryLight, borderRadius: radius.md, paddingHorizontal: spacing.sm },
  stepIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceDim,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepIconActive: { backgroundColor: colors.primary },
  stepText: { ...typography.body, color: colors.text },
  stepTextActive: { fontWeight: '600', color: colors.primary },
  stepMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});

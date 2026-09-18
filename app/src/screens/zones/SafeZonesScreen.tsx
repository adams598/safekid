import React, { useState } from 'react';
import {
  Alert as RNAlert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Circle, MapPressEvent, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AppStackParamList, SafeZone, SafeZoneType } from '../../types';
import { colors, radius, spacing, typography } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

type Route = RouteProp<AppStackParamList, 'SafeZones'>;

const ZONE_TYPES: { type: SafeZoneType; label: string; emoji: string; color: string }[] = [
  { type: 'home', label: 'Maison', emoji: '🏠', color: colors.primary },
  { type: 'school', label: 'École', emoji: '🏫', color: colors.secondary },
  { type: 'family', label: 'Famille', emoji: '👨‍👩‍👧', color: '#FF9F0A' },
  { type: 'friend', label: 'Ami(e)', emoji: '👫', color: '#AF52DE' },
  { type: 'activity', label: 'Activité', emoji: '⚽', color: '#FF6B35' },
  { type: 'custom', label: 'Autre', emoji: '📍', color: colors.textSecondary },
];

export function SafeZonesScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { childId } = route.params;
  const { children, safeZones, addSafeZone, updateSafeZone, deleteSafeZone } = useAppStore();
  const child = children.find((c) => c.id === childId);
  const childZones = safeZones.filter((z) => z.childId === childId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newZoneCenter, setNewZoneCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneType, setNewZoneType] = useState<SafeZoneType>('home');
  const [newZoneRadius, setNewZoneRadius] = useState(150);
  const [selectedZone, setSelectedZone] = useState<SafeZone | null>(null);

  const handleMapPress = (e: MapPressEvent) => {
    if (showAddModal) {
      setNewZoneCenter(e.nativeEvent.coordinate);
    }
  };

  const handleAddZone = () => {
    if (!newZoneCenter || !newZoneName.trim()) return;

    const typeConfig = ZONE_TYPES.find((t) => t.type === newZoneType)!;
    const newZone: SafeZone = {
      id: `zone_${Date.now()}`,
      childId,
      name: newZoneName,
      address: `${newZoneCenter.latitude.toFixed(4)}, ${newZoneCenter.longitude.toFixed(4)}`,
      center: newZoneCenter,
      radius: newZoneRadius,
      type: newZoneType,
      isActive: true,
      notifyOnEntry: true,
      notifyOnExit: true,
      color: typeConfig.color,
    };

    addSafeZone(newZone);
    setShowAddModal(false);
    setNewZoneCenter(null);
    setNewZoneName('');
    setNewZoneRadius(150);
  };

  const confirmDelete = (zone: SafeZone) => {
    RNAlert.alert(
      'Supprimer la zone',
      `Voulez-vous supprimer la zone "${zone.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteSafeZone(zone.id),
        },
      ],
    );
  };

  const mapCenter = childZones[0]?.center ?? child?.currentLocation ?? { latitude: 3.848, longitude: 11.502 };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Zones de sécurité</Text>
          <Text style={styles.headerSubtitle}>{child?.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          ...mapCenter,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        onPress={handleMapPress}
        customMapStyle={mapStyleLight}
      >
        {childZones.map((zone) => (
          <React.Fragment key={zone.id}>
            <Circle
              center={zone.center}
              radius={zone.radius}
              fillColor={zone.isActive ? colors.safeZone : 'rgba(161,168,180,0.15)'}
              strokeColor={zone.isActive ? colors.safeZoneBorder : 'rgba(161,168,180,0.4)'}
              strokeWidth={1.5}
            />
            <Marker
              coordinate={zone.center}
              onPress={() => setSelectedZone(zone)}
            >
              <View style={[styles.zoneMarker, { backgroundColor: zone.color }]}>
                <Text style={styles.zoneMarkerEmoji}>
                  {ZONE_TYPES.find((t) => t.type === zone.type)?.emoji ?? '📍'}
                </Text>
              </View>
            </Marker>
          </React.Fragment>
        ))}

        {newZoneCenter && (
          <>
            <Marker coordinate={newZoneCenter}>
              <View style={[styles.zoneMarker, { backgroundColor: colors.primary }]}>
                <Text style={styles.zoneMarkerEmoji}>📍</Text>
              </View>
            </Marker>
            <Circle
              center={newZoneCenter}
              radius={newZoneRadius}
              fillColor={colors.safeZone}
              strokeColor={colors.safeZoneBorder}
              strokeWidth={2}
            />
          </>
        )}
      </MapView>

      {/* Zone list */}
      <ScrollView style={styles.zoneList} contentContainerStyle={{ padding: spacing.base, gap: spacing.md }}>
        {childZones.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyTitle}>Aucune zone définie</Text>
            <Text style={styles.emptyText}>
              Appuyez sur + pour ajouter une zone de sécurité pour {child?.name}.
            </Text>
            <Button
              title="Ajouter une zone"
              onPress={() => setShowAddModal(true)}
              size="md"
            />
          </View>
        ) : (
          childZones.map((zone) => (
            <Card key={zone.id} style={styles.zoneCard}>
              <View style={styles.zoneCardRow}>
                <View style={[styles.zoneIcon, { backgroundColor: zone.color + '20' }]}>
                  <Text style={styles.zoneEmoji}>
                    {ZONE_TYPES.find((t) => t.type === zone.type)?.emoji ?? '📍'}
                  </Text>
                </View>
                <View style={styles.zoneInfo}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zoneRadius}>Rayon : {zone.radius}m</Text>
                  <View style={styles.zoneNotifs}>
                    {zone.notifyOnExit && (
                      <View style={styles.notifTag}>
                        <Ionicons name="exit-outline" size={12} color={colors.danger} />
                        <Text style={styles.notifText}>Sortie</Text>
                      </View>
                    )}
                    {zone.notifyOnEntry && (
                      <View style={[styles.notifTag, { backgroundColor: colors.successLight }]}>
                        <Ionicons name="enter-outline" size={12} color={colors.success} />
                        <Text style={[styles.notifText, { color: colors.success }]}>Entrée</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.zoneActions}>
                  <Switch
                    value={zone.isActive}
                    onValueChange={(v) => updateSafeZone(zone.id, { isActive: v })}
                    trackColor={{ false: colors.border, true: colors.secondary }}
                    thumbColor={colors.white}
                    style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                  />
                  <TouchableOpacity onPress={() => confirmDelete(zone)}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add Zone Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvelle zone</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.fieldLabel}>Nom de la zone *</Text>
            <TextInput
              style={styles.textInput}
              value={newZoneName}
              onChangeText={setNewZoneName}
              placeholder="Ex: École, Maison, Chez grand-mère..."
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Type de zone</Text>
            <View style={styles.typeGrid}>
              {ZONE_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.type}
                  style={[
                    styles.typeChip,
                    newZoneType === t.type && { backgroundColor: t.color + '20', borderColor: t.color },
                  ]}
                  onPress={() => setNewZoneType(t.type)}
                >
                  <Text style={styles.typeEmoji}>{t.emoji}</Text>
                  <Text style={[styles.typeLabel, newZoneType === t.type && { color: t.color }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Rayon de sécurité : {newZoneRadius}m</Text>
            <View style={styles.radiusButtons}>
              {[50, 100, 150, 200, 300, 500].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.radiusChip, newZoneRadius === r && styles.radiusChipActive]}
                  onPress={() => setNewZoneRadius(r)}
                >
                  <Text style={[styles.radiusText, newZoneRadius === r && styles.radiusTextActive]}>
                    {r}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.mapTip}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.mapTipText}>
                {newZoneCenter
                  ? `Position choisie : ${newZoneCenter.latitude.toFixed(4)}, ${newZoneCenter.longitude.toFixed(4)}`
                  : 'Fermez ce panneau et appuyez sur la carte pour choisir la position de la zone.'}
              </Text>
            </View>

            <Button
              title="Créer la zone"
              onPress={handleAddZone}
              fullWidth
              size="lg"
              disabled={!newZoneCenter || !newZoneName.trim()}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const mapStyleLight = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f7' }] },
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
    gap: spacing.md,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h2, color: colors.text },
  headerSubtitle: { ...typography.caption, color: colors.textMuted },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: { height: 260 },
  zoneMarker: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  zoneMarkerEmoji: { fontSize: 18 },
  zoneList: { flex: 1 },
  emptyState: { alignItems: 'center', paddingTop: spacing['3xl'], gap: spacing.base },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...typography.h2, color: colors.text },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  zoneCard: { padding: spacing.md },
  zoneCardRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  zoneIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  zoneEmoji: { fontSize: 22 },
  zoneInfo: { flex: 1, gap: 4 },
  zoneName: { ...typography.h3, color: colors.text },
  zoneRadius: { ...typography.caption, color: colors.textMuted },
  zoneNotifs: { flexDirection: 'row', gap: spacing.xs },
  notifTag: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.dangerLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.full },
  notifText: { ...typography.labelSmall, color: colors.danger },
  zoneActions: { alignItems: 'center', gap: spacing.sm },
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
  modalContent: { padding: spacing['2xl'], gap: spacing.base },
  fieldLabel: { ...typography.labelLarge, color: colors.text },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    ...typography.bodyLarge,
    color: colors.text,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeEmoji: { fontSize: 16 },
  typeLabel: { ...typography.label, color: colors.textSecondary },
  radiusButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  radiusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  radiusChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  radiusText: { ...typography.label, color: colors.textSecondary },
  radiusTextActive: { color: colors.primary },
  mapTip: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'flex-start',
  },
  mapTipText: { ...typography.body, color: colors.primary, flex: 1 },
});

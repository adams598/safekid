import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList, MovementReport, ReportPeriod } from '../../types';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: 'weekly', label: 'Semaine' },
  { value: 'monthly', label: 'Mois' },
  { value: 'quarterly', label: 'Trimestre' },
];

export function ReportsScreen() {
  const navigation = useNavigation<Nav>();
  const { reports, children } = useAppStore();
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('monthly');

  const filteredReports = reports.filter((r) => r.period === selectedPeriod);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rapports</Text>
      </View>

      {/* Period selector */}
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[styles.periodButton, selectedPeriod === p.value && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod(p.value)}
          >
            <Text style={[styles.periodText, selectedPeriod === p.value && styles.periodTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filteredReports.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>Aucun rapport</Text>
            <Text style={styles.emptyText}>
              Les rapports de déplacements seront disponibles après 7 jours d'utilisation.
            </Text>
          </View>
        ) : (
          filteredReports.map((report) => {
            const child = children.find((c) => c.id === report.childId);
            return (
              <ReportCard
                key={report.id}
                report={report}
                childColor={child?.color ?? colors.primary}
                onPress={() => navigation.navigate('ReportDetail', { reportId: report.id })}
              />
            );
          })
        )}

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.infoBannerText}>
            Les rapports sont générés automatiquement chaque semaine. Vous pouvez les télécharger en PDF.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ReportCard({
  report,
  childColor,
  onPress,
}: {
  report: MovementReport;
  childColor: string;
  onPress: () => void;
}) {
  const periodLabel: Record<ReportPeriod, string> = {
    weekly: 'Rapport hebdomadaire',
    monthly: 'Rapport mensuel',
    quarterly: 'Rapport trimestriel',
  };

  return (
    <Card elevated style={styles.reportCard} onPress={onPress}>
      {/* Top */}
      <View style={styles.reportTop}>
        <Avatar name={report.childName} color={childColor} size={44} />
        <View style={styles.reportInfo}>
          <Text style={styles.reportChildName}>{report.childName}</Text>
          <Text style={styles.reportPeriodLabel}>{periodLabel[report.period]}</Text>
          <Text style={styles.reportDates}>
            {format(new Date(report.startDate), 'd MMM', { locale: fr })} —{' '}
            {format(new Date(report.endDate), 'd MMM yyyy', { locale: fr })}
          </Text>
        </View>
        <TouchableOpacity style={styles.downloadButton}>
          <Ionicons name="download-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="map-outline" size={16} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{report.totalDistance} km</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.dangerLight }]}>
            <Ionicons name="notifications-outline" size={16} color={colors.danger} />
          </View>
          <Text style={styles.statValue}>{report.totalAlerts}</Text>
          <Text style={styles.statLabel}>Alertes</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.secondaryLight }]}>
            <Ionicons name="location-outline" size={16} color={colors.secondary} />
          </View>
          <Text style={styles.statValue}>{report.zonesVisited.length}</Text>
          <Text style={styles.statLabel}>Zones</Text>
        </View>
      </View>

      {/* Zones visited */}
      <View style={styles.zonesList}>
        {report.zonesVisited.slice(0, 3).map((visit) => (
          <View key={visit.zoneId} style={styles.zoneRow}>
            <Text style={styles.zoneName} numberOfLines={1}>{visit.zoneName}</Text>
            <Text style={styles.zoneVisits}>{visit.visitCount}x</Text>
            <Text style={styles.zoneDuration}>
              {Math.round(visit.totalDuration / 60)}h
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.reportFooter}>
        <Text style={styles.reportFooterText}>Voir le rapport complet</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </View>
    </Card>
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
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    alignItems: 'center',
    backgroundColor: colors.surfaceDim,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  periodButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  periodText: { ...typography.labelLarge, color: colors.textMuted },
  periodTextActive: { color: colors.primary },
  list: { padding: spacing.base, gap: spacing.base, paddingBottom: 40 },
  reportCard: { gap: spacing.md },
  reportTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  reportInfo: { flex: 1, gap: 3 },
  reportChildName: { ...typography.h3, color: colors.text },
  reportPeriodLabel: { ...typography.body, color: colors.textSecondary },
  reportDates: { ...typography.caption, color: colors.textMuted },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: { flex: 1, alignItems: 'center', gap: spacing.xs },
  statIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statValue: { ...typography.h2, color: colors.text },
  statLabel: { ...typography.caption, color: colors.textMuted },
  statDivider: { width: 1, backgroundColor: colors.border, height: '100%' },
  zonesList: { gap: spacing.xs },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  zoneName: { ...typography.body, color: colors.text, flex: 1 },
  zoneVisits: { ...typography.label, color: colors.textMuted },
  zoneDuration: { ...typography.label, color: colors.primary, minWidth: 32, textAlign: 'right' },
  reportFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, paddingTop: 4 },
  reportFooterText: { ...typography.label, color: colors.primary },
  // Empty
  emptyState: { alignItems: 'center', paddingTop: spacing['3xl'], gap: spacing.base },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { ...typography.h2, color: colors.text },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  infoBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'flex-start',
  },
  infoBannerText: { ...typography.body, color: colors.primary, flex: 1 },
});

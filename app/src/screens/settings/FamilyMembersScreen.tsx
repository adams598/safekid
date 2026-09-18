import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing, typography } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';

export function FamilyMembersScreen() {
  const navigation = useNavigation();
  const { familyMembers, removeFamilyMember, children } = useAppStore();

  const confirmRemove = (id: string, name: string) => {
    Alert.alert(
      'Retirer ce membre',
      `Voulez-vous retirer ${name} de votre famille ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Retirer', style: 'destructive', onPress: () => removeFamilyMember(id) },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membres de la famille</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
          <Text style={styles.infoBannerText}>
            Les membres peuvent voir la localisation des enfants qui leur sont assignés, et recevoir les alertes.
          </Text>
        </View>

        {familyMembers.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.emptyTitle}>Aucun membre ajouté</Text>
            <Text style={styles.emptyText}>
              Invitez votre conjoint(e) ou d'autres membres de confiance à surveiller les enfants.
            </Text>
          </View>
        ) : (
          familyMembers.map((member) => {
            const linkedChildren = children.filter((c) =>
              member.linkedChildIds.includes(c.id),
            );
            return (
              <Card key={member.id} style={styles.memberCard}>
                <View style={styles.memberRow}>
                  <Avatar name={member.fullName} size={48} />
                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>{member.fullName}</Text>
                      <View style={[styles.roleTag, member.role === 'primary' && styles.primaryTag]}>
                        <Text style={[styles.roleText, member.role === 'primary' && styles.primaryText]}>
                          {member.role === 'primary' ? 'Principal' : 'Secondaire'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.memberPhone}>{member.phone}</Text>
                    <View style={styles.linkedRow}>
                      <Ionicons name="people-outline" size={12} color={colors.textMuted} />
                      <Text style={styles.linkedText}>
                        {linkedChildren.map((c) => c.name).join(', ') || 'Aucun enfant'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => confirmRemove(member.id, member.fullName)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>

                <View style={styles.memberActions}>
                  <View style={styles.notifRow}>
                    <Ionicons
                      name={member.notificationsEnabled ? 'notifications' : 'notifications-off-outline'}
                      size={16}
                      color={member.notificationsEnabled ? colors.success : colors.textMuted}
                    />
                    <Text style={[styles.notifText, !member.notificationsEnabled && styles.notifTextOff]}>
                      {member.notificationsEnabled ? 'Alertes activées' : 'Alertes désactivées'}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}

        <Button
          title="Inviter un membre"
          variant="outline"
          icon={<Ionicons name="person-add-outline" size={18} color={colors.primary} />}
          fullWidth
          size="lg"
          onPress={() => {}}
        />

        <Text style={styles.inviteNote}>
          Un lien d'invitation sera envoyé par SMS ou WhatsApp. Ils devront télécharger SafeKid et accepter votre invitation.
        </Text>
      </ScrollView>
    </View>
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
  scroll: { padding: spacing.base, gap: spacing.base, paddingBottom: 40 },
  infoBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'flex-start',
  },
  infoBannerText: { ...typography.body, color: colors.primary, flex: 1 },
  empty: { alignItems: 'center', paddingTop: spacing['2xl'], gap: spacing.base },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...typography.h2, color: colors.text },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  memberCard: { padding: spacing.base, gap: spacing.sm },
  memberRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  memberInfo: { flex: 1, gap: 4 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  memberName: { ...typography.h3, color: colors.text },
  roleTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.surfaceDim,
    borderRadius: radius.full,
  },
  primaryTag: { backgroundColor: colors.primaryLight },
  roleText: { ...typography.labelSmall, color: colors.textMuted },
  primaryText: { color: colors.primary },
  memberPhone: { ...typography.body, color: colors.textSecondary },
  linkedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkedText: { ...typography.caption, color: colors.textMuted },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberActions: { paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  notifText: { ...typography.body, color: colors.success },
  notifTextOff: { color: colors.textMuted },
  inviteNote: { ...typography.caption, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';
import { getRoleDisplayLabel } from '../utils/accessControl';

interface AccessRestrictedViewProps {
  portalTitle: string;
  requiredRoleLabel: string;
  currentUserRole?: string | null;
}

export default function AccessRestrictedView({
  portalTitle,
  requiredRoleLabel,
  currentUserRole,
}: AccessRestrictedViewProps) {
  const router = useRouter();

  const isGuest = !currentUserRole;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Access Control</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Center Content */}
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-outline" size={44} color="#f59e0b" />
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={16} color="#ffffff" />
          </View>
        </View>

        <Text style={styles.title}>Access Restricted</Text>
        <Text style={styles.subtitle}>
          You do not have permission to view the <Text style={styles.bold}>{portalTitle}</Text>.
        </Text>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Required Access</Text>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredBadgeText}>{requiredRoleLabel}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Your Current Role</Text>
            <View style={[styles.roleBadge, isGuest ? styles.guestBadge : null]}>
              <Text style={[styles.roleBadgeText, isGuest ? styles.guestBadgeText : null]}>
                {getRoleDisplayLabel(currentUserRole)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isGuest ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push('/auth/login' as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="log-in-outline" size={18} color="#ffffff" />
              <Text style={styles.primaryBtnText}>Sign In with Authorized Account</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push('/(tabs)/profile' as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="person-outline" size={18} color="#ffffff" />
              <Text style={styles.primaryBtnText}>Return to Account & Portals</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back-outline" size={18} color={COLORS.textPrimary} />
            <Text style={styles.secondaryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
    backgroundColor: COLORS.cardDark,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fffbeb',
    borderWidth: 2,
    borderColor: '#fde68a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    padding: 16,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  requiredBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  requiredBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
  },
  roleBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  guestBadge: {
    backgroundColor: '#f1f5f9',
  },
  guestBadgeText: {
    color: '#64748b',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryBtnText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});

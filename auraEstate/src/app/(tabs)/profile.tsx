import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import EditProfileModal from '../../components/EditProfileModal';
import {
  canAccessPortal,
  PORTAL_CONFIG,
  DashboardPortal,
  getRoleDisplayLabel,
} from '../../utils/accessControl';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, openAuthModal } = useAuth();
  const [editProfileOpen, setEditProfileOpen] = useState<boolean>(false);

  const handlePortalPress = (portalKey: DashboardPortal) => {
    const config = PORTAL_CONFIG[portalKey];
    if (!config) return;

    if (!user) {
      Alert.alert(
        'Sign In Required',
        `Please sign in to access the ${config.title}.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/login' as any) },
        ]
      );
      return;
    }

    const hasAccess = canAccessPortal(user.role, portalKey);
    if (!hasAccess) {
      Alert.alert(
        'Access Restricted',
        `You are currently signed in as ${getRoleDisplayLabel(user.role)} (${user.role.toUpperCase()}).\n\nThe ${config.title} is restricted to: ${config.requiredRoleLabel}.`,
        [
          { text: 'OK', style: 'default' },
          { text: 'Switch Account', onPress: () => router.push('/auth/login' as any) },
        ]
      );
      return;
    }

    router.push(config.route as any);
  };

  const getDashboardRoute = () => {
    if (!user) return '/auth/login';
    switch (user.role) {
      case 'super_admin':
      case 'admin':
        return '/dashboard/admin';
      case 'agent':
        return '/dashboard/agent';
      default:
        return '/dashboard/buyer';
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account & Portals</Text>
        </View>

        {user ? (
          /* Logged In User Card */
          <View style={styles.userCard}>
            <View style={styles.userRow}>
              <Image
                source={{
                  uri:
                    user.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
                }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {user.role ? user.role.toUpperCase().replace('_', ' ') : 'BUYER'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Action: Primary Dashboard */}
            <Pressable
              style={styles.primaryDashboardBtn}
              onPress={() => router.push(getDashboardRoute() as any)}
            >
              <Ionicons name="speedometer-outline" size={20} color="#ffffff" />
              <Text style={styles.primaryDashboardBtnText}>
                Launch My {user.role ? user.role.toUpperCase().replace('_', ' ') : 'PORTAL'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#ffffff" style={{ marginLeft: 'auto' }} />
            </Pressable>

            {/* Edit Profile */}
            <Pressable style={styles.editProfileBtn} onPress={() => setEditProfileOpen(true)}>
              <Ionicons name="create-outline" size={16} color={AuraColors.primaryDark} />
              <Text style={styles.editProfileBtnText}>Edit Profile Info</Text>
            </Pressable>
          </View>
        ) : (
          /* Guest CTA Card */
          <View style={styles.guestCard}>
            <View style={styles.guestIconCircle}>
              <Ionicons name="person-outline" size={32} color={AuraColors.primary} />
            </View>
            <Text style={styles.guestTitle}>Welcome to AuraEstates</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to manage luxury properties, track formal offers, schedule private inspections, or access broker dashboards.
            </Text>
            <View style={styles.guestActionsRow}>
              <Pressable style={styles.signInBtn} onPress={() => router.push('/auth/login' as any)}>
                <Text style={styles.signInBtnText}>Sign In</Text>
              </Pressable>
              <Pressable style={styles.signUpBtn} onPress={() => router.push('/auth/register' as any)}>
                <Text style={styles.signUpBtnText}>Register</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Role Portal Explorer (Only visible when user is logged in with access) */}
        {user && (() => {
          const portalItems = [
            {
              key: 'buyer' as DashboardPortal,
              title: 'Buyer & Renter Portal',
              sub: 'Offers, inspection bookings, deposits',
              icon: 'home' as const,
              iconBg: AuraColors.primaryLight,
              iconColor: AuraColors.primaryDark,
              badgeBg: AuraColors.primaryLight,
              badgeColor: AuraColors.primaryDark,
              badgeText: 'Active',
            },
            {
              key: 'agent' as DashboardPortal,
              title: 'Agent CRM & Performance',
              sub: 'Leads pipeline, live chat inbox, listings',
              icon: 'briefcase' as const,
              iconBg: AuraColors.violetLight,
              iconColor: AuraColors.violet,
              badgeBg: AuraColors.violetLight,
              badgeColor: AuraColors.violet,
              badgeText: 'Agent',
            },
            {
              key: 'admin' as DashboardPortal,
              title: 'System Admin Operations',
              sub: 'Metrics, property approvals, users, CSV',
              icon: 'shield-checkmark' as const,
              iconBg: AuraColors.amberLight,
              iconColor: AuraColors.amber,
              badgeBg: AuraColors.amberLight,
              badgeColor: AuraColors.amber,
              badgeText: 'Admin',
            },
          ];

          const accessiblePortals = portalItems.filter(item =>
            canAccessPortal(user.role, item.key)
          );

          if (accessiblePortals.length === 0) return null;

          return (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>ROLE DASHBOARDS</Text>
                <View style={styles.rbacPill}>
                  <Ionicons name="shield-checkmark" size={12} color={AuraColors.primaryDark} />
                  <Text style={styles.rbacPillText}>Role-Based Access</Text>
                </View>
              </View>

              <View style={styles.menuBox}>
                {accessiblePortals.map((item, index) => {
                  const isLast = index === accessiblePortals.length - 1;
                  return (
                    <Pressable
                      key={item.key}
                      style={[styles.menuItem, isLast ? { borderBottomWidth: 0 } : null]}
                      onPress={() => handlePortalPress(item.key)}
                    >
                      <View style={[styles.menuIconCircle, { backgroundColor: item.iconBg }]}>
                        <Ionicons name={item.icon} size={18} color={item.iconColor} />
                      </View>
                      <View style={styles.menuTextWrap}>
                        <View style={styles.titleRow}>
                          <Text style={styles.menuItemTitle}>{item.title}</Text>
                          <View style={[styles.accessBadge, { backgroundColor: item.badgeBg }]}>
                            <Text style={[styles.accessBadgeText, { color: item.badgeColor }]}>
                              {item.badgeText}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.menuItemSub}>{item.sub}</Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={AuraColors.textLight}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })()}

        {/* Directory & Content Shortcuts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPLORE DIRECTORIES & NEWS</Text>
          <View style={styles.menuBox}>
            <Pressable style={styles.menuItem} onPress={() => router.push('/agents' as any)}>
              <Ionicons name="people-outline" size={20} color={AuraColors.primary} style={{ marginRight: 12 }} />
              <Text style={styles.simpleMenuTitle}>Find Real Estate Agents</Text>
              <Ionicons name="chevron-forward" size={18} color={AuraColors.textLight} />
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => router.push('/agency' as any)}>
              <Ionicons name="business-outline" size={20} color={AuraColors.primary} style={{ marginRight: 12 }} />
              <Text style={styles.simpleMenuTitle}>Verified Brokerage Agencies</Text>
              <Ionicons name="chevron-forward" size={18} color={AuraColors.textLight} />
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => router.push('/sold' as any)}>
              <Ionicons name="cash-outline" size={20} color={AuraColors.primary} style={{ marginRight: 12 }} />
              <Text style={styles.simpleMenuTitle}>Recently Sold & Auctions</Text>
              <Ionicons name="chevron-forward" size={18} color={AuraColors.textLight} />
            </Pressable>

            <Pressable style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => router.push('/blogs' as any)}>
              <Ionicons name="newspaper-outline" size={20} color={AuraColors.primary} style={{ marginRight: 12 }} />
              <Text style={styles.simpleMenuTitle}>Market Insights & Advisory</Text>
              <Ionicons name="chevron-forward" size={18} color={AuraColors.textLight} />
            </Pressable>
          </View>
        </View>

        {/* Sign out */}
        {user ? (
          <Pressable style={styles.signOutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color={AuraColors.rose} />
            <Text style={styles.signOutBtnText}>Sign Out from AuraEstates</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal visible={editProfileOpen} onClose={() => setEditProfileOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: AuraColors.text,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e2e8f0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: AuraColors.text,
  },
  userEmail: {
    fontSize: 12,
    color: AuraColors.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: AuraColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: AuraColors.primaryDark,
  },
  primaryDashboardBtn: {
    backgroundColor: AuraColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: AuraColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  primaryDashboardBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.primaryDark,
  },
  guestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guestIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: AuraColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AuraColors.text,
    marginBottom: 6,
  },
  guestSubtitle: {
    fontSize: 12,
    color: AuraColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  guestActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  signInBtn: {
    flex: 1,
    backgroundColor: AuraColors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  signInBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  signUpBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  signUpBtnText: {
    color: AuraColors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: AuraColors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AuraColors.text,
  },
  menuItemSub: {
    fontSize: 11,
    color: AuraColors.textMuted,
    marginTop: 2,
  },
  simpleMenuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: AuraColors.text,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  rbacPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AuraColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rbacPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: AuraColors.primaryDark,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accessBadge: {
    backgroundColor: AuraColors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  accessBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: AuraColors.primaryDark,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lockBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: AuraColors.textMuted,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: AuraColors.roseLight,
    marginTop: 8,
  },
  signOutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: AuraColors.rose,
  },
});

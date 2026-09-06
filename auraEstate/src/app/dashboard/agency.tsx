import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { fetchAgencyById, registerUser } from '@/services/api';
import { COLORS } from '@/constants/colors';

const FALLBACK_AGENTS = [
  { _id: '507f1f77bcf86cd799439002', name: 'Ishika Bhatia', email: 'ishikabhatia51@gmail.com', phone: '+61 412 345 678', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400', listingsCount: 14 },
  { _id: '507f1f77bcf86cd799439005', name: 'Upansh Sharma', email: 'upansh769@gmail.com', phone: '+61 423 456 789', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400', listingsCount: 19 },
  { _id: '507f1f77bcf86cd799439006', name: 'Reet Kaur', email: 'reet67711@gmail.com', phone: '+61 434 567 890', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', listingsCount: 8 },
  { _id: '507f1f77bcf86cd799439007', name: 'Ruhi Bhatia', email: 'ruhibhatia0022@gmail.com', phone: '+61 445 678 901', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', listingsCount: 12 },
];

export default function AgencyDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [agencyData, setAgencyData] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>(FALLBACK_AGENTS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Invite Agent Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const loadData = async () => {
    try {
      if (user?.agencyId) {
        const res = await fetchAgencyById(user.agencyId);
        if (res.data?.success) {
          setAgencyData(res.data);
          if (res.data.agents && res.data.agents.length > 0) {
            setAgents(res.data.agents);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load agency details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleInviteAgent = async () => {
    if (!agentName.trim() || !agentEmail.trim()) {
      Alert.alert('Missing Info', 'Please enter agent full name and email.');
      return;
    }

    setInviting(true);
    try {
      const res = await registerUser({
        name: agentName.trim(),
        email: agentEmail.trim(),
        password: 'password123',
        role: 'agent',
        agencyId: user?.agencyId || '507f1f77bcf86cd799439001',
      });

      if (res.data?.success) {
        const newAgent = res.data.user;
        setAgents(prev => [newAgent, ...prev]);
        setShowInviteModal(false);
        setAgentName('');
        setAgentEmail('');
        Alert.alert(
          'Agent Registered',
          `Invitation successfully generated for ${newAgent.email}! Default password: password123`
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to register agent');
    } finally {
      setInviting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.badgeText}>AGENCY HEADQUARTERS</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {agencyData?.name || user?.name || 'Brokerage Performance'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.inviteBtn}
          onPress={() => setShowInviteModal(true)}
        >
          <Ionicons name="person-add-outline" size={16} color="#0f172a" />
          <Text style={styles.inviteBtnText}>Invite</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Agency Banner Card */}
            <View style={styles.agencyHeroCard}>
              <View style={styles.agencyIconBadge}>
                <Ionicons name="business" size={28} color="#0f172a" />
              </View>
              <Text style={styles.agencyHeroTitle}>{agencyData?.name || 'Prestige Realty Group'}</Text>
              <Text style={styles.agencyHeroLocation}>
                📍 {agencyData?.location || 'Barangaroo & Eastern Suburbs, Sydney NSW'}
              </Text>
              <Text style={styles.agencyHeroDesc}>
                {agencyData?.description || 'Premier luxury brokerage representing prime residential estates and waterfront developments.'}
              </Text>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{agents.length}</Text>
                  <Text style={styles.statLabel}>Active Agents</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>54</Text>
                  <Text style={styles.statLabel}>Total Listings</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>$184M+</Text>
                  <Text style={styles.statLabel}>Portfolio Value</Text>
                </View>
              </View>
            </View>

            {/* Agent Roster Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Agent Roster ({agents.length})</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(true)}>
                <Text style={styles.addAgentLink}>+ Add Agent</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rosterGrid}>
              {agents.map((ag) => (
                <View key={ag._id} style={styles.agentCard}>
                  <View style={styles.agentAvatarWrap}>
                    {ag.avatar ? (
                      <Image source={{ uri: ag.avatar }} style={styles.agentAvatar} />
                    ) : (
                      <View style={[styles.agentAvatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={20} color={COLORS.primary} />
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.agentName}>{ag.name}</Text>
                    <Text style={styles.agentEmail}>{ag.email}</Text>
                    <Text style={styles.agentPhone}>{ag.phone || '+61 400 000 000'}</Text>
                    <View style={styles.agentBadge}>
                      <Text style={styles.agentBadgeText}>Licensed Associate</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Invite Agent Modal */}
      <Modal visible={showInviteModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>Invite Agent to Roster</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Create credentials for your associate. They will receive portal access and agent dashboard tools.
            </Text>

            <View style={styles.modalForm}>
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Agent Full Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Stephanie Wright"
                  placeholderTextColor={COLORS.textMuted}
                  value={agentName}
                  onChangeText={setAgentName}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Agent Email Address</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="name@agency.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={agentEmail}
                  onChangeText={setAgentEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, inviting && { opacity: 0.7 }]}
                onPress={handleInviteAgent}
                disabled={inviting}
              >
                {inviting ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Create Agent Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  inviteBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  agencyHeroCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  agencyIconBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  agencyHeroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  agencyHeroLocation: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  agencyHeroDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    marginTop: 16,
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.borderDark,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  addAgentLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  rosterGrid: {
    gap: 12,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  agentAvatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  agentAvatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  agentEmail: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  agentPhone: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  agentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  agentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.bgDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  modalForm: {
    gap: 12,
    marginTop: 6,
  },
  modalInputGroup: {
    gap: 6,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
  },
  modalInput: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    fontSize: 13,
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { fetchAgencyById } from '../../services/api';
import PropertyCard from '../../components/PropertyCard';

export default function AgencyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [agencyData, setAgencyData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchAgencyById(id);
        if (res.data?.success) {
          setAgencyData(res.data);
        }
      } catch (e) {
        console.error('Agency detail error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AuraColors.primary} />
        <Text style={styles.loaderText}>Loading Agency Portfolio...</Text>
      </SafeAreaView>
    );
  }

  if (!agencyData || !agencyData.agency) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={AuraColors.rose} />
        <Text style={styles.notFoundTitle}>Agency Profile Not Found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const { agency, agents = [], properties = [] } = agencyData;

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={AuraColors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {agency.name}
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.logoRow}>
            <Image source={{ uri: agency.logo }} style={styles.logo} resizeMode="contain" />
            <View style={styles.nameWrap}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.agencyName}>{agency.name}</Text>
                <Ionicons name="checkmark-circle" size={16} color={AuraColors.emerald} />
              </View>
              <Text style={styles.licenseText}>Licence #{agency.licenseNumber}</Text>
              <Text style={styles.addressText}>
                {agency.address?.street}, {agency.address?.city} {agency.address?.state}
              </Text>
            </View>
          </View>

          {/* Stats bar */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>⭐ {agency.rating || 4.9}</Text>
              <Text style={styles.statLabel}>Agency Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{properties.length}</Text>
              <Text style={styles.statLabel}>Active Listings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{agents.length}</Text>
              <Text style={styles.statLabel}>Brokers</Text>
            </View>
          </View>

          <Text style={styles.descriptionText}>{agency.description}</Text>
        </View>

        {/* Agency Brokers Roster */}
        {agents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brokerage Agents</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {agents.map((ag: any) => (
                <View key={ag._id} style={styles.agentCard}>
                  <Image
                    source={{
                      uri:
                        ag.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
                    }}
                    style={styles.agentAvatar}
                  />
                  <Text style={styles.agentName} numberOfLines={1}>
                    {ag.name}
                  </Text>
                  <Text style={styles.agentRole}>{ag.role || 'Agent'}</Text>
                  <Pressable
                    style={styles.contactAgentBtn}
                    onPress={() => Linking.openURL(`mailto:${ag.email || 'info@auraestates.com.au'}`)}
                  >
                    <Ionicons name="mail-outline" size={14} color={AuraColors.primaryDark} />
                    <Text style={styles.contactAgentBtnText}>Contact</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Active Properties Portfolio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Property Portfolio ({properties.length})</Text>
          <View style={styles.propertiesList}>
            {properties.map((prop: any) => (
              <PropertyCard key={prop._id} property={prop} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  loaderText: {
    fontSize: 12,
    color: AuraColors.textMuted,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AuraColors.text,
  },
  backBtn: {
    backgroundColor: AuraColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AuraColors.text,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    padding: 18,
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  nameWrap: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  agencyName: {
    fontSize: 18,
    fontWeight: '900',
    color: AuraColors.text,
  },
  licenseText: {
    fontSize: 11,
    fontWeight: '700',
    color: AuraColors.primaryDark,
    marginTop: 2,
  },
  addressText: {
    fontSize: 11,
    color: AuraColors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  statItem: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: AuraColors.text,
  },
  statLabel: {
    fontSize: 10,
    color: AuraColors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  descriptionText: {
    fontSize: 13,
    color: AuraColors.textSecondary,
    lineHeight: 19,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: AuraColors.text,
    marginBottom: 8,
  },
  agentCard: {
    width: 140,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  agentName: {
    fontSize: 12,
    fontWeight: '800',
    color: AuraColors.text,
    textAlign: 'center',
  },
  agentRole: {
    fontSize: 10,
    color: AuraColors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  contactAgentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AuraColors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  contactAgentBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AuraColors.primaryDark,
  },
  propertiesList: {
    marginTop: 8,
  },
});

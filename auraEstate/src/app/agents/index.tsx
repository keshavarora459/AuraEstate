import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { fetchAgents } from '../../services/api';

export default function FindAgentsScreen() {
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAgents();
        if (res.data?.success && res.data.agents) {
          setAgents(res.data.agents);
        }
      } catch (err) {
        console.warn('Failed to load agents from server:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const locations = ['All', 'NSW', 'VIC', 'QLD', 'ACT', 'WA'];

  const filteredAgents = agents.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.specialties && a.specialties.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))) ||
      (a.licenseNumber && a.licenseNumber.toLowerCase().includes(search.toLowerCase()));

    const matchLocation =
      locationFilter === 'All' ||
      (a.location && a.location.includes(locationFilter)) ||
      (a.address?.state && a.address.state.includes(locationFilter));

    return matchSearch && matchLocation;
  });

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={AuraColors.text} />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Find Real Estate Agents</Text>
          <Text style={styles.headerSubtitle}>Verified Australian Property Specialists</Text>
        </View>
      </View>

      {/* Search & Location Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={16} color={AuraColors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by agent name, specialty, or license..."
            placeholderTextColor={AuraColors.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* State filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stateChipsScroll}>
          {locations.map((loc) => (
            <Pressable
              key={loc}
              style={[styles.stateChip, locationFilter === loc && styles.stateChipActive]}
              onPress={() => setLocationFilter(loc)}
            >
              <Text style={[styles.stateChipText, locationFilter === loc && styles.stateChipTextActive]}>
                {loc}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={AuraColors.primary} />
          <Text style={styles.loaderText}>Loading Agent Directory...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAgents}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.agentCard}>
              <View style={styles.agentHeader}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.agentDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.agentName}>{item.name}</Text>
                    <Ionicons name="shield-checkmark" size={16} color={AuraColors.emerald} />
                  </View>
                  <Text style={styles.agentSubText}>Licence #{item.licenseNumber}</Text>
                  <Text style={styles.agentLocation}>
                    📍 {item.location || `${item.address?.city}, ${item.address?.state}`}
                  </Text>
                </View>
              </View>

              <Text style={styles.bioText} numberOfLines={2}>
                {item.bio}
              </Text>

              {/* Specialties */}
              {item.specialties && item.specialties.length > 0 && (
                <View style={styles.specialtiesRow}>
                  {item.specialties.map((s: string) => (
                    <View key={s} style={styles.specialtyChip}>
                      <Text style={styles.specialtyText}>{s}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Stats Bar */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{item.dealsCount || 45}</Text>
                  <Text style={styles.statLabel}>Deals Closed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>⭐ {item.rating ? item.rating.toFixed(1) : '4.9'}</Text>
                  <Text style={styles.statLabel}>Client Rating</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                {item.phone ? (
                  <Pressable
                    style={styles.callBtn}
                    onPress={() => Linking.openURL(`tel:${item.phone}`)}
                  >
                    <Ionicons name="call-outline" size={16} color={AuraColors.text} />
                    <Text style={styles.callBtnText}>Call</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  style={styles.emailBtn}
                  onPress={() => Linking.openURL(`mailto:${item.email}`)}
                >
                  <Ionicons name="mail-outline" size={16} color="#ffffff" />
                  <Text style={styles.emailBtnText}>Contact Agent</Text>
                </Pressable>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  backBtn: {
    padding: 6,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: AuraColors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: AuraColors.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  searchBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: AuraColors.text,
  },
  stateChipsScroll: {
    marginTop: 10,
  },
  stateChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  stateChipActive: {
    backgroundColor: AuraColors.primary,
  },
  stateChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: AuraColors.textSecondary,
  },
  stateChipTextActive: {
    color: '#ffffff',
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loaderText: {
    fontSize: 12,
    color: AuraColors.textMuted,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  agentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  agentHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#e2e8f0',
  },
  agentDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  agentName: {
    fontSize: 15,
    fontWeight: '800',
    color: AuraColors.text,
  },
  agentSubText: {
    fontSize: 11,
    fontWeight: '700',
    color: AuraColors.primaryDark,
    marginTop: 2,
  },
  agentLocation: {
    fontSize: 11,
    color: AuraColors.textMuted,
    marginTop: 2,
  },
  bioText: {
    fontSize: 12,
    color: AuraColors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  specialtyChip: {
    backgroundColor: AuraColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  specialtyText: {
    fontSize: 10,
    fontWeight: '700',
    color: AuraColors.primaryDark,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: AuraColors.text,
  },
  statLabel: {
    fontSize: 10,
    color: AuraColors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e2e8f0',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.text,
  },
  emailBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: AuraColors.primary,
  },
  emailBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});

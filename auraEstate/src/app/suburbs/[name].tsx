import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { fetchProperties } from '../../services/api';
import PropertyCard from '../../components/PropertyCard';

const SUBURB_STATS: Record<string, any> = {
  'Point Piper': {
    medianHouse: 18500000,
    medianUnit: 4200000,
    clearanceRate: 82,
    daysOnMarket: 41,
    growth: 12.4,
    trend: 'up',
    description:
      "Point Piper is one of Sydney's most prestigious harbourside suburbs, consistently ranking among Australia's most expensive postcodes. Offering direct deep-water harbour access and panoramic Sydney Harbour Bridge views.",
  },
  'Barangaroo': {
    medianHouse: null,
    medianUnit: 2850000,
    clearanceRate: 78,
    daysOnMarket: 33,
    growth: 9.1,
    trend: 'up',
    description:
      "Barangaroo is a world-class urban renewal precinct on Sydney Harbour's western edge, boasting high-rise architectural sky penthouses and Michelin-level waterfront dining.",
  },
  'Bondi Beach': {
    medianHouse: 4800000,
    medianUnit: 1650000,
    clearanceRate: 74,
    daysOnMarket: 38,
    growth: 7.2,
    trend: 'up',
    description:
      "Bondi Beach is one of Australia's most iconic coastal suburbs, famous for golden surf, lively lifestyle cafés, and prestigious beachfront apartments.",
  },
  'Mosman': {
    medianHouse: 5200000,
    medianUnit: 1350000,
    clearanceRate: 76,
    daysOnMarket: 44,
    growth: 6.8,
    trend: 'up',
    description:
      'Mosman is an affluent Lower North Shore enclave renowned for historic Federation mansions, prestigious private academies, and tranquil harbour views.',
  },
  'Toorak': {
    medianHouse: 5900000,
    medianUnit: 1200000,
    clearanceRate: 73,
    daysOnMarket: 52,
    growth: 4.2,
    trend: 'up',
    description:
      "Toorak is Melbourne's most exclusive luxury suburb, featuring grand Victorian estates, tree-lined boulevards, and Australia's highest density of private wealth.",
  },
  'Noosa Heads': {
    medianHouse: 3200000,
    medianUnit: 1100000,
    clearanceRate: 68,
    daysOnMarket: 47,
    growth: 8.6,
    trend: 'up',
    description:
      'Noosa Heads offers ultra-luxury coastal living along the Sunshine Coast, renowned for Hastings Street boutiques and pristine national park headlands.',
  },
  'default': {
    medianHouse: 1800000,
    medianUnit: 720000,
    clearanceRate: 65,
    daysOnMarket: 42,
    growth: 5.1,
    trend: 'up',
    description:
      'A sought-after Australian suburb offering a compelling mix of lifestyle, investment potential, and community character.',
  },
};

const NEARBY_SCHOOLS = [
  { name: 'Ascham School', type: 'Private Girls', rating: '4.8', distance: '0.8 km' },
  { name: 'Cranbrook School', type: 'Private Boys', rating: '4.7', distance: '1.2 km' },
  { name: 'Sydney Grammar School', type: 'Private Co-ed', rating: '4.9', distance: '1.6 km' },
];

export default function SuburbProfileScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const suburb = decodeURIComponent(name || 'Point Piper');
  const stats = SUBURB_STATS[suburb] || SUBURB_STATS['default'];

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchProperties({ suburb, limit: 6 });
        if (res.data?.success) {
          setProperties(res.data.properties || []);
        }
      } catch (e) {
        console.error('Suburb load error', e);
      } finally {
        setLoading(false);
      }
    };
    if (suburb) load();
  }, [suburb]);

  const fmt = (n: number | null) => (n ? `$${(n / 1000000).toFixed(2)}M` : 'N/A');

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={AuraColors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {suburb} Profile
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Suburb Hero Card */}
        <View style={styles.heroCard}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1000',
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroText}>
            <View style={styles.suburbBadge}>
              <Ionicons name="location" size={12} color="#ffffff" />
              <Text style={styles.suburbBadgeText}>SUBURB PROFILE</Text>
            </View>
            <Text style={styles.suburbTitle}>{suburb}</Text>
          </View>
        </View>

        {/* 4-Stat Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>MEDIAN HOUSE</Text>
            <Text style={styles.statVal}>{fmt(stats.medianHouse)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>MEDIAN UNIT</Text>
            <Text style={styles.statVal}>{fmt(stats.medianUnit)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>CLEARANCE RATE</Text>
            <Text style={styles.statVal}>{stats.clearanceRate}%</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>AVG. DAYS ON MKT</Text>
            <Text style={styles.statVal}>{stats.daysOnMarket} Days</Text>
          </View>
        </View>

        {/* Suburb Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Overview & Demographics</Text>
          <Text style={styles.descriptionText}>{stats.description}</Text>
        </View>

        {/* Prestigious Nearby Schools */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Top Nearby Schools</Text>
          {NEARBY_SCHOOLS.map((school, i) => (
            <View key={i} style={styles.schoolItem}>
              <View>
                <Text style={styles.schoolName}>{school.name}</Text>
                <Text style={styles.schoolType}>{school.type}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.schoolDist}>{school.distance}</Text>
                <Text style={styles.schoolRating}>⭐ {school.rating}/5</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Active Suburb Properties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Listings in {suburb}</Text>
          {loading ? (
            <ActivityIndicator color={AuraColors.primary} style={{ marginVertical: 20 }} />
          ) : properties.length === 0 ? (
            <View style={styles.emptySuburbProps}>
              <Ionicons name="home-outline" size={36} color={AuraColors.textLight} />
              <Text style={styles.emptyPropsText}>No active listings currently in {suburb}</Text>
              <Pressable style={styles.exploreAllBtn} onPress={() => router.push('/explore' as any)}>
                <Text style={styles.exploreAllBtnText}>Browse All Suburbs</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ marginTop: 8 }}>
              {properties.map((p) => (
                <PropertyCard key={p._id} property={p} />
              ))}
            </View>
          )}
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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    height: 170,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  heroText: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  suburbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(14, 165, 233, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  suburbBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  suburbTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    padding: 14,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: AuraColors.textMuted,
    letterSpacing: 0.5,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '900',
    color: AuraColors.primaryDark,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AuraColors.text,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 13,
    color: AuraColors.textSecondary,
    lineHeight: 20,
  },
  schoolItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  schoolName: {
    fontSize: 13,
    fontWeight: '700',
    color: AuraColors.text,
  },
  schoolType: {
    fontSize: 11,
    color: AuraColors.textMuted,
    marginTop: 2,
  },
  schoolDist: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.text,
  },
  schoolRating: {
    fontSize: 10,
    color: AuraColors.amber,
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  emptySuburbProps: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    gap: 8,
    marginTop: 8,
  },
  emptyPropsText: {
    fontSize: 12,
    color: AuraColors.textMuted,
    textAlign: 'center',
  },
  exploreAllBtn: {
    backgroundColor: AuraColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 6,
  },
  exploreAllBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});

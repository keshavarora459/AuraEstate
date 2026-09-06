import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';

const MOCK_SOLD = [
  {
    id: 's1',
    title: 'Grand Harbourfront Villa',
    address: '14 Wolseley Road, Point Piper NSW 2027',
    soldPrice: 22400000,
    soldDate: '2026-07-12',
    bedrooms: 6,
    bathrooms: 7,
    parking: 6,
    suburb: 'Point Piper',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 's2',
    title: 'Bondi Beachfront Penthouse',
    address: '120 Campbell Parade, Bondi Beach NSW 2026',
    soldPrice: 4850000,
    soldDate: '2026-07-28',
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    suburb: 'Bondi Beach',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 's3',
    title: 'Toorak European Villa',
    address: '12 St Georges Road, Toorak VIC 3142',
    soldPrice: 16500000,
    soldDate: '2026-06-30',
    bedrooms: 5,
    bathrooms: 6,
    parking: 5,
    suburb: 'Toorak',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 's4',
    title: 'Brighton Esplanade Beachside',
    address: '64 Esplanade, Brighton VIC 3186',
    soldPrice: 9400000,
    soldDate: '2026-07-05',
    bedrooms: 5,
    bathrooms: 4,
    parking: 4,
    suburb: 'Brighton',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 's5',
    title: 'Mosman Heritage Residence',
    address: '72 Raglan Street, Mosman NSW 2088',
    soldPrice: 6900000,
    soldDate: '2026-08-01',
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    suburb: 'Mosman',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 's6',
    title: 'Noosa Heads Eco Estate',
    address: '22 Alderly Terrace, Noosa Heads QLD 4567',
    soldPrice: 8900000,
    soldDate: '2026-07-19',
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    suburb: 'Noosa Heads',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800',
  },
];

export default function SoldScreen() {
  const router = useRouter();
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<'date' | 'price_desc' | 'price_asc'>('date');

  const filtered = MOCK_SOLD.filter((item) => {
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.suburb.toLowerCase().includes(search.toLowerCase()) ||
      item.address.toLowerCase().includes(search.toLowerCase())
    );
  }).sort((a, b) => {
    if (sort === 'date') return new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime();
    if (sort === 'price_desc') return b.soldPrice - a.soldPrice;
    if (sort === 'price_asc') return a.soldPrice - b.soldPrice;
    return 0;
  });

  const totalValue = filtered.reduce((acc, curr) => acc + curr.soldPrice, 0);

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={AuraColors.text} />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Recently Sold</Text>
          <Text style={styles.headerSubtitle}>Auction & Private Treaty Results</Text>
        </View>
      </View>

      {/* Search and stats bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={16} color={AuraColors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search suburb or street..."
            placeholderTextColor={AuraColors.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Sort Toggles */}
        <View style={styles.sortRow}>
          <Pressable
            style={[styles.sortBtn, sort === 'date' && styles.sortBtnActive]}
            onPress={() => setSort('date')}
          >
            <Text style={[styles.sortBtnText, sort === 'date' && styles.sortBtnTextActive]}>
              Recent
            </Text>
          </Pressable>
          <Pressable
            style={[styles.sortBtn, sort === 'price_desc' && styles.sortBtnActive]}
            onPress={() => setSort('price_desc')}
          >
            <Text style={[styles.sortBtnText, sort === 'price_desc' && styles.sortBtnTextActive]}>
              Highest $
            </Text>
          </Pressable>
          <Pressable
            style={[styles.sortBtn, sort === 'price_asc' && styles.sortBtnActive]}
            onPress={() => setSort('price_asc')}
          >
            <Text style={[styles.sortBtnText, sort === 'price_asc' && styles.sortBtnTextActive]}>
              Lowest $
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Overview Volume Callout */}
      <View style={styles.volumeCard}>
        <Text style={styles.volumeLabel}>RECORDED TRANSACTIONS VALUE</Text>
        <Text style={styles.volumeAmount}>${(totalValue / 1000000).toFixed(1)}M AUD</Text>
        <Text style={styles.volumeSub}>{filtered.length} prestige settlement records</Text>
      </View>

      {/* Sold List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.soldCard}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.soldBadge}>
              <Text style={styles.soldBadgeText}>SOLD</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardPrice}>${(item.soldPrice / 1000000).toFixed(2)}M</Text>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.cardAddress} numberOfLines={1}>
                {item.address}
              </Text>

              <View style={styles.specsAndDateRow}>
                <Text style={styles.specsText}>
                  {item.bedrooms} Bed • {item.bathrooms} Bath • {item.parking} Car
                </Text>
                <Text style={styles.dateText}>Settled {item.soldDate}</Text>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    gap: 10,
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
  sortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  sortBtnActive: {
    backgroundColor: AuraColors.primary,
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AuraColors.textSecondary,
  },
  sortBtnTextActive: {
    color: '#ffffff',
  },
  volumeCard: {
    backgroundColor: '#0f172a',
    margin: 16,
    marginBottom: 8,
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  volumeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: AuraColors.primary,
    letterSpacing: 0.8,
  },
  volumeAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginVertical: 4,
  },
  volumeSub: {
    fontSize: 11,
    color: '#94a3b8',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  soldCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  soldBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  soldBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  cardBody: {
    padding: 14,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: AuraColors.primaryDark,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: AuraColors.text,
    marginBottom: 2,
  },
  cardAddress: {
    fontSize: 12,
    color: AuraColors.textMuted,
    marginBottom: 10,
  },
  specsAndDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  specsText: {
    fontSize: 11,
    fontWeight: '600',
    color: AuraColors.textSecondary,
  },
  dateText: {
    fontSize: 11,
    color: AuraColors.textMuted,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { fetchSoldProperties } from '../../services/api';
import {
  getPropertyId,
  getPropertyTitle,
  getPropertyAddress,
  getPropertyBedrooms,
  getPropertyBathrooms,
  getPropertyGarages,
  getPropertyImages,
} from '../../utils/propertyHelper';

export default function SoldScreen() {
  const router = useRouter();
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<'date' | 'price_desc' | 'price_asc'>('date');
  const [soldItems, setSoldItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadSoldProperties = async () => {
    try {
      const res = await fetchSoldProperties();
      if (res.data?.success) {
        setSoldItems(res.data.properties || []);
      }
    } catch (err) {
      console.warn('Failed to load sold properties from server:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSoldProperties();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadSoldProperties();
  };

  const filtered = soldItems.filter((item) => {
    const title = getPropertyTitle(item);
    const address = getPropertyAddress(item);
    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      address.toLowerCase().includes(search.toLowerCase())
    );
  }).sort((a, b) => {
    const priceA = a.soldPrice || a.price_numeric || (typeof a.price === 'number' ? a.price : 0);
    const priceB = b.soldPrice || b.price_numeric || (typeof b.price === 'number' ? b.price : 0);
    if (sort === 'date') return new Date(b.soldDate || b.updatedAt || b.created_at || 0).getTime() - new Date(a.soldDate || a.updatedAt || a.created_at || 0).getTime();
    if (sort === 'price_desc') return priceB - priceA;
    if (sort === 'price_asc') return priceA - priceB;
    return 0;
  });

  const totalValue = filtered.reduce((acc, curr) => {
    const p = curr.soldPrice || curr.price_numeric || (typeof curr.price === 'number' ? curr.price : 650000);
    return acc + p;
  }, 0);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={AuraColors.text} />
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
              Highest Price
            </Text>
          </Pressable>
          <Pressable
            style={[styles.sortBtn, sort === 'price_asc' && styles.sortBtnActive]}
            onPress={() => setSort('price_asc')}
          >
            <Text style={[styles.sortBtnText, sort === 'price_asc' && styles.sortBtnTextActive]}>
              Lowest Price
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
        keyExtractor={(item) => getPropertyId(item)}
        renderItem={({ item }) => {
          const img = getPropertyImages(item)[0];
          const title = getPropertyTitle(item);
          const address = getPropertyAddress(item);
          const beds = getPropertyBedrooms(item);
          const baths = getPropertyBathrooms(item);
          const cars = getPropertyGarages(item);
          const priceNum = item.soldPrice || item.price_numeric || (typeof item.price === 'number' ? item.price : 650000);
          const priceDisplay = priceNum >= 1000000 ? `$${(priceNum / 1000000).toFixed(2)}M` : `$${priceNum.toLocaleString()}`;

          return (
            <Pressable
              style={styles.soldCard}
              onPress={() => router.push(`/property/${getPropertyId(item)}` as any)}
            >
              <Image source={{ uri: img }} style={styles.cardImage} />
              <View style={styles.soldBadge}>
                <Text style={styles.soldBadgeText}>SOLD</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardPrice}>{priceDisplay}</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.cardAddress} numberOfLines={1}>
                  {address}
                </Text>

                <View style={styles.specsAndDateRow}>
                  <Text style={styles.specsText}>
                    {beds} Bed • {baths} Bath • {cars} Car
                  </Text>
                  <Text style={styles.dateText}>
                    {item.soldDate ? `Settled ${item.soldDate}` : 'Recorded'}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[AuraColors.primary]} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={AuraColors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="documents-outline" size={40} color={AuraColors.textMuted} />
              <Text style={{ marginTop: 8, color: AuraColors.textMuted, fontWeight: '600' }}>
                No sold records found matching your search.
              </Text>
            </View>
          )
        }
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
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
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

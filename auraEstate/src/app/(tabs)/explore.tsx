import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { fetchProperties } from '../../services/api';
import PropertyCard from '../../components/PropertyCard';
import PropertyFiltersModal, { FilterState } from '../../components/PropertyFiltersModal';

export default function ExploreScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{
    suburb?: string;
    listingType?: string;
    propertyType?: string;
    search?: string;
  }>();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.search || '',
    suburb: searchParams.suburb || '',
    listingType: searchParams.listingType || '',
    propertyType: searchParams.propertyType || '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    minLandArea: '',
    maxLandArea: '',
    sortBy: 'newest',
  });

  const debounceTimer = useRef<any>(null);

  const doFetch = useCallback(async (activeFilters: FilterState, activePage: number) => {
    setLoading(true);
    try {
      const params: any = { page: activePage, limit: 10 };
      if (activeFilters.search) params.search = activeFilters.search;
      if (activeFilters.suburb) params.suburb = activeFilters.suburb;
      if (activeFilters.listingType) params.listingType = activeFilters.listingType;
      if (activeFilters.propertyType) params.propertyType = activeFilters.propertyType;
      if (activeFilters.minPrice) params.minPrice = activeFilters.minPrice;
      if (activeFilters.maxPrice) params.maxPrice = activeFilters.maxPrice;
      if (activeFilters.bedrooms) params.bedrooms = activeFilters.bedrooms;
      if (activeFilters.sortBy && activeFilters.sortBy !== 'newest') params.sortBy = activeFilters.sortBy;

      const res = await fetchProperties(params);
      if (res.data?.success) {
        let results = res.data.properties || [];

        // Client side filters if backend query didn't filter
        if (activeFilters.bathrooms) {
          results = results.filter((p: any) => p.bathrooms >= parseInt(activeFilters.bathrooms));
        }
        if (activeFilters.parking) {
          results = results.filter((p: any) => (p.parkingSpaces || 0) >= parseInt(activeFilters.parking));
        }

        setProperties(results);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || results.length);
      }
    } catch (e) {
      console.warn('Failed to fetch properties (backend may be offline):', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      doFetch(filters, 1);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [filters, doFetch]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    doFetch(filters, 1);
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      suburb: '',
      listingType: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      parking: '',
      minLandArea: '',
      maxLandArea: '',
      sortBy: 'newest',
    });
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'sortBy' && v === 'newest') return false;
    return !!v;
  }).length;

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Top Search & Filter Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color={AuraColors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search address, suburb, title..."
            placeholderTextColor={AuraColors.textLight}
            value={filters.search}
            onChangeText={(t) => setFilters((prev) => ({ ...prev, search: t }))}
          />
          {filters.search ? (
            <Pressable onPress={() => setFilters((prev) => ({ ...prev, search: '' }))}>
              <Ionicons name="close-circle" size={18} color={AuraColors.textLight} />
            </Pressable>
          ) : null}
        </View>

        {/* Filter Toggle Button */}
        <Pressable
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setFiltersOpen(true)}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={activeFilterCount > 0 ? '#ffffff' : AuraColors.text}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Quick Intent Pills: All / For Sale / For Rent */}
      <View style={styles.pillsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {[
            { label: 'All Listings', val: '' },
            { label: 'To Buy', val: 'Sale' },
            { label: 'To Rent', val: 'Rent' },
          ].map((item) => {
            const isSelected = filters.listingType === item.val;
            return (
              <Pressable
                key={item.label}
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => setFilters((prev) => ({ ...prev, listingType: item.val }))}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}

          {/* Quick Suburb chips if any is set */}
          {filters.suburb ? (
            <View style={[styles.pill, styles.pillActive]}>
              <Text style={[styles.pillText, styles.pillTextActive]}>📍 {filters.suburb}</Text>
              <Pressable onPress={() => setFilters((prev) => ({ ...prev, suburb: '' }))} style={{ marginLeft: 4 }}>
                <Ionicons name="close" size={14} color="#ffffff" />
              </Pressable>
            </View>
          ) : null}

          {filters.propertyType ? (
            <View style={[styles.pill, styles.pillActive]}>
              <Text style={[styles.pillText, styles.pillTextActive]}>🏠 {filters.propertyType}</Text>
              <Pressable onPress={() => setFilters((prev) => ({ ...prev, propertyType: '' }))} style={{ marginLeft: 4 }}>
                <Ionicons name="close" size={14} color="#ffffff" />
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </View>

      {/* Results Count Bar */}
      <View style={styles.resultsCountBar}>
        <Text style={styles.resultsCountText}>
          {loading ? 'Searching catalog...' : `${totalCount} Properties Found`}
        </Text>
      </View>

      {/* Property List */}
      {loading && !refreshing ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={AuraColors.primary} />
          <Text style={styles.loaderText}>Filtering Luxury Listings...</Text>
        </View>
      ) : properties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={54} color={AuraColors.textLight} />
          <Text style={styles.emptyTitle}>No Properties Found</Text>
          <Text style={styles.emptySubtitle}>
            We couldn't find any listings matching your active filters. Try clearing your search parameters.
          </Text>
          <Pressable style={styles.resetBtn} onPress={handleResetFilters}>
            <Text style={styles.resetBtnText}>Clear All Filters</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <PropertyCard property={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[AuraColors.primary]}
            />
          }
        />
      )}

      {/* Filter Modal */}
      <PropertyFiltersModal
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#ffffff',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: AuraColors.text,
    fontWeight: '600',
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: AuraColors.primary,
    borderColor: AuraColors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AuraColors.rose,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  pillsContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  pillsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pillActive: {
    backgroundColor: AuraColors.primary,
    borderColor: AuraColors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.textSecondary,
  },
  pillTextActive: {
    color: '#ffffff',
  },
  resultsCountBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultsCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.textMuted,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 13,
    color: AuraColors.textMuted,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AuraColors.text,
  },
  emptySubtitle: {
    fontSize: 12,
    color: AuraColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  resetBtn: {
    backgroundColor: AuraColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});

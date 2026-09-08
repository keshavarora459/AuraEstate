import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { fetchAgencies } from '../../services/api';

export default function AgenciesScreen() {
  const router = useRouter();
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadAgencies = async () => {
    try {
      const res = await fetchAgencies();
      if (res.data?.success) {
        setAgencies(res.data.agencies || []);
      }
    } catch (e) {
      console.error('Failed to load agencies', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAgencies();
  };

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
          <Text style={styles.headerTitle}>Verified Brokerages</Text>
          <Text style={styles.headerSubtitle}>Australia's Top Real Estate Agencies</Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={AuraColors.primary} />
          <Text style={styles.loaderText}>Loading Partner Brokerages...</Text>
        </View>
      ) : (
        <FlatList
          data={agencies}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.agencyCard}
              onPress={() => router.push(`/agency/${item._id}` as any)}
            >
              <Image
                source={{
                  uri:
                    item.coverImage ||
                    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
                }}
                style={styles.coverImage}
              />
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#ffffff" />
                <Text style={styles.ratingText}>{item.rating || 4.9}</Text>
              </View>

              <View style={styles.body}>
                <View style={styles.logoRow}>
                  <Image source={{ uri: item.logo }} style={styles.logo} resizeMode="contain" />
                  <View style={styles.nameWrap}>
                    <Text style={styles.nameText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.licenseText}>Licence #{item.licenseNumber}</Text>
                  </View>
                </View>

                <Text style={styles.descriptionText} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={AuraColors.textMuted} />
                    <Text style={styles.locationText}>
                      {item.address?.city || 'Sydney'}, {item.address?.state || 'NSW'}
                    </Text>
                  </View>
                  <Text style={styles.salesCount}>{item.totalSales || 45} Sales Closed</Text>
                </View>
              </View>
            </Pressable>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[AuraColors.primary]} />}
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
  agencyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  coverImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#0f172a',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(14, 165, 233, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  body: {
    padding: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  nameWrap: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '800',
    color: AuraColors.text,
  },
  licenseText: {
    fontSize: 11,
    fontWeight: '700',
    color: AuraColors.primaryDark,
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 12,
    color: AuraColors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    color: AuraColors.textMuted,
  },
  salesCount: {
    fontSize: 11,
    fontWeight: '700',
    color: AuraColors.primaryDark,
  },
});

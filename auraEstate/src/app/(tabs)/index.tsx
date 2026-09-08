import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import {
  fetchProperties,
  fetchAgencies,
  fetchAdminBlogs,
  fetchSuburbs,
  fetchSoldProperties
} from '../../services/api';
import PropertyCard from '../../components/PropertyCard';

export default function HomeScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [suburbs, setSuburbs] = useState<any[]>([]);
  const [soldItems, setSoldItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [propRes, agencyRes, blogRes, suburbRes, soldRes] = await Promise.all([
        fetchProperties({ limit: 6 }).catch(() => null),
        fetchAgencies().catch(() => null),
        fetchAdminBlogs().catch(() => null),
        fetchSuburbs().catch(() => null),
        fetchSoldProperties({ limit: 4 }).catch(() => null),
      ]);

      if (propRes?.data?.success) setFeaturedProperties(propRes.data.properties || []);
      if (agencyRes?.data?.success) setAgencies(agencyRes.data.agencies || []);
      if (blogRes?.data?.success && blogRes.data.blogs) setBlogs(blogRes.data.blogs);
      if (suburbRes?.data?.success && suburbRes.data.suburbs) setSuburbs(suburbRes.data.suburbs);
      if (soldRes?.data?.success && soldRes.data.properties) setSoldItems(soldRes.data.properties);
    } catch (e) {
      console.warn('Home load error (backend may be offline):', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleHeroSearch = () => {
    router.push({
      pathname: '/explore',
      params: {
        suburb: searchQuery,
        propertyType,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Top Header Navigation */}
      <View style={styles.navHeader}>
        <View style={styles.brandRow}>
          <View style={styles.brandLogo}>
            <Ionicons name="business" size={20} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>
              AURA<Text style={styles.brandTitleHighlight}>ESTATES</Text>
            </Text>
            <Text style={styles.brandSubtitle}>Luxury Real Estate</Text>
          </View>
        </View>

        <Pressable style={styles.aiHeaderBtn} onPress={() => router.push('/ai-chat' as any)}>
          <Ionicons name="sparkles" size={14} color={AuraColors.primaryDark} />
          <Text style={styles.aiHeaderBtnText}>Aura AI</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[AuraColors.primary]} />}
      >
        {/* Hero Section Banner */}
        <View style={styles.heroCard}>
          <Text style={styles.heroSubtitle}>DISCOVER EXCEPTIONAL</Text>
          <Text style={styles.heroTitle}>Real Estate Masterpieces</Text>
          <Text style={styles.heroDescription}>
            Explore waterfront villas, sky penthouses, and high-yield commercial assets across Australia.
          </Text>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <View style={styles.inputWithIcon}>
              <Ionicons name="location-outline" size={18} color={AuraColors.primary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Suburb (e.g. Point Piper, Toorak)..."
                placeholderTextColor={AuraColors.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <Pressable style={styles.searchBtn} onPress={handleHeroSearch}>
              <Ionicons name="search" size={16} color="#ffffff" />
              <Text style={styles.searchBtnText}>Search Properties</Text>
            </Pressable>
          </View>

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>$4.8B+</Text>
              <Text style={styles.metricLabel}>Portfolio</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>98.4%</Text>
              <Text style={styles.metricLabel}>AI Accuracy</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>1,250+</Text>
              <Text style={styles.metricLabel}>Agencies</Text>
            </View>
          </View>
        </View>

        {/* Top Suburbs Explorer Strip */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionPreTitle}>DISCOVER</Text>
            <Text style={styles.sectionTitle}>Explore Top Suburbs</Text>
          </View>
          <Pressable onPress={() => router.push('/explore' as any)}>
            <Text style={styles.seeAllText}>View All →</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suburbsScroll}>
          {suburbs.filter((s) => s.name !== 'default').map((suburb) => (
            <Pressable
              key={suburb._id || suburb.name}
              style={styles.suburbCard}
              onPress={() => router.push(`/suburbs/${encodeURIComponent(suburb.name)}` as any)}
            >
              <Image source={{ uri: suburb.image || suburb.img }} style={styles.suburbImage} />
              <View style={styles.suburbOverlay} />
              <View style={styles.suburbTextWrap}>
                <Text style={styles.suburbName}>{suburb.name}</Text>
                <Text style={styles.suburbMedian}>{suburb.medianPrice || suburb.median || 'Prestige'} median</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Featured Properties Carousel / List */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionPreTitle}>PRESTIGE SELECTION</Text>
            <Text style={styles.sectionTitle}>Featured Properties</Text>
          </View>
          <Pressable onPress={() => router.push('/explore' as any)}>
            <Text style={styles.seeAllText}>View All →</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={AuraColors.primary} style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.propertiesList}>
            {featuredProperties.slice(0, 4).map((prop) => (
              <PropertyCard key={prop._id} property={prop} />
            ))}
          </View>
        )}

        {/* Partner Agencies Strip */}
        {agencies.length > 0 && (
          <View style={styles.agenciesSection}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionPreTitle}>TRUSTED PARTNERS</Text>
                <Text style={styles.sectionTitle}>Premier Agencies</Text>
              </View>
              <Pressable onPress={() => router.push('/agency' as any)}>
                <Text style={styles.seeAllText}>All Agencies →</Text>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.agenciesScroll}>
              {agencies.map((agency) => (
                <Pressable
                  key={agency._id}
                  style={styles.agencyCard}
                  onPress={() => router.push(`/agency/${agency._id}` as any)}
                >
                  <Image source={{ uri: agency.logo }} style={styles.agencyLogo} resizeMode="contain" />
                  <Text style={styles.agencyName} numberOfLines={1}>
                    {agency.name}
                  </Text>
                  <View style={styles.agencyRatingRow}>
                    <Text style={styles.agencyRatingText}>⭐ {agency.rating || 4.9}</Text>
                    <Text style={styles.agencySalesText}>• {agency.totalSales || 45} Sales</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recently Sold Strip */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionPreTitle}>AUCTION RESULTS</Text>
            <Text style={styles.sectionTitle}>Recently Sold</Text>
          </View>
          <Pressable onPress={() => router.push('/sold' as any)}>
            <Text style={styles.seeAllText}>View All Sold →</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.soldScroll}>
          {soldItems.map((item, idx) => (
            <Pressable key={item._id || item.id || idx} style={styles.soldCard} onPress={() => router.push('/sold' as any)}>
              <Image source={{ uri: item.image || item.img }} style={styles.soldImage} />
              <View style={styles.soldBadge}>
                <Text style={styles.soldBadgeText}>SOLD</Text>
              </View>
              <View style={styles.soldBody}>
                <Text style={styles.soldTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.soldLocation}>{item.suburb || item.address}</Text>
                <View style={styles.soldPriceRow}>
                  <Text style={styles.soldPrice}>
                    {item.soldPrice ? `$${(item.soldPrice / 1000000).toFixed(1)}M` : (item.price ? `$${(item.price / 1000000).toFixed(1)}M` : '$12.5M')}
                  </Text>
                  <Text style={styles.soldDate}>{item.soldDate || item.date || 'Recent'}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Find an Agent Callout */}
        <View style={styles.agentCallout}>
          <View style={styles.agentCalloutBadge}>
            <Ionicons name="people" size={14} color={AuraColors.primary} />
            <Text style={styles.agentCalloutBadgeText}>EXPERT NETWORK</Text>
          </View>
          <Text style={styles.agentCalloutTitle}>Find Your Verified Real Estate Agent</Text>
          <Text style={styles.agentCalloutDesc}>
            Connect directly with 1,250+ certified brokers across Australia for personalized luxury advice.
          </Text>
          <Pressable style={styles.agentCalloutBtn} onPress={() => router.push('/agents' as any)}>
            <Text style={styles.agentCalloutBtnText}>Browse Verified Agents</Text>
            <Ionicons name="arrow-forward" size={16} color="#ffffff" />
          </Pressable>
        </View>

        {/* Market Insights / Blogs */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionPreTitle}>REPORTS & ANALYTICS</Text>
            <Text style={styles.sectionTitle}>Market Insights</Text>
          </View>
          <Pressable onPress={() => router.push('/blogs' as any)}>
            <Text style={styles.seeAllText}>All Articles →</Text>
          </Pressable>
        </View>

        <View style={styles.blogsList}>
          {blogs.slice(0, 2).map((blog, idx) => (
            <Pressable
              key={blog._id || blog.id || idx}
              style={styles.blogCard}
              onPress={() => router.push('/blogs' as any)}
            >
              <Image
                source={{
                  uri: blog.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800',
                }}
                style={styles.blogImage}
              />
              <View style={styles.blogBody}>
                <Text style={styles.blogCategory}>{blog.category || 'Insights'}</Text>
                <Text style={styles.blogTitle} numberOfLines={2}>
                  {blog.title || 'Market Update'}
                </Text>
                <Text style={styles.blogExcerpt} numberOfLines={2}>
                  {blog.excerpt || blog.content || ''}
                </Text>
              </View>
            </Pressable>
          ))}
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
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: AuraColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: AuraColors.text,
    letterSpacing: -0.5,
  },
  brandTitleHighlight: {
    color: AuraColors.primary,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: AuraColors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  aiHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AuraColors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  aiHeaderBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: AuraColors.primaryDark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  heroSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: AuraColors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: AuraColors.text,
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: 13,
    color: AuraColors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  searchBox: {
    gap: 10,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: AuraColors.text,
    fontWeight: '600',
  },
  searchBtn: {
    backgroundColor: AuraColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: AuraColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  searchBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '900',
    color: AuraColors.text,
  },
  metricLabel: {
    fontSize: 10,
    color: AuraColors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
    marginTop: 8,
  },
  sectionPreTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: AuraColors.primary,
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: AuraColors.text,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.primaryDark,
  },
  suburbsScroll: {
    marginBottom: 24,
  },
  suburbCard: {
    width: 140,
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  suburbImage: {
    width: '100%',
    height: '100%',
  },
  suburbOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  suburbTextWrap: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  suburbName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  suburbMedian: {
    color: AuraColors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  propertiesList: {
    marginBottom: 14,
  },
  agenciesSection: {
    marginBottom: 14,
  },
  agenciesScroll: {
    marginBottom: 20,
  },
  agencyCard: {
    width: 170,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    padding: 14,
    marginRight: 12,
    alignItems: 'center',
  },
  agencyLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 10,
  },
  agencyName: {
    fontSize: 13,
    fontWeight: '800',
    color: AuraColors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  agencyRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agencyRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: AuraColors.amber,
  },
  agencySalesText: {
    fontSize: 11,
    color: AuraColors.textMuted,
  },
  soldScroll: {
    marginBottom: 24,
  },
  soldCard: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    overflow: 'hidden',
    marginRight: 12,
  },
  soldImage: {
    width: '100%',
    height: 120,
  },
  soldBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  soldBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  soldBody: {
    padding: 12,
  },
  soldTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AuraColors.text,
    marginBottom: 2,
  },
  soldLocation: {
    fontSize: 11,
    color: AuraColors.textMuted,
    marginBottom: 8,
  },
  soldPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  soldPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: AuraColors.text,
  },
  soldDate: {
    fontSize: 10,
    color: AuraColors.textMuted,
  },
  agentCallout: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#e0f2fe',
    padding: 22,
    marginBottom: 24,
    alignItems: 'center',
    textAlign: 'center',
    shadowColor: AuraColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  agentCalloutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 10,
  },
  agentCalloutBadgeText: {
    color: AuraColors.primaryDark,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  agentCalloutTitle: {
    color: AuraColors.text,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  agentCalloutDesc: {
    color: AuraColors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  agentCalloutBtn: {
    backgroundColor: AuraColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: AuraColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  agentCalloutBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  blogsList: {
    gap: 12,
  },
  blogCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    overflow: 'hidden',
    padding: 10,
    gap: 12,
  },
  blogImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  blogBody: {
    flex: 1,
    justifyContent: 'center',
  },
  blogCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: AuraColors.primary,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  blogTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AuraColors.text,
    marginBottom: 4,
  },
  blogExcerpt: {
    fontSize: 11,
    color: AuraColors.textMuted,
    lineHeight: 15,
  },
});

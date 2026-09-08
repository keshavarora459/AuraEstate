import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { fetchPropertyById, fetchSimilarProperties } from '../../services/api';
import PropertyCard from '../../components/PropertyCard';
import InspectionBookingModal from '../../components/InspectionBookingModal';
import EnquiryModal from '../../components/EnquiryModal';

import {
  getPropertyId,
  getPropertyTitle,
  getPropertyPrice,
  getPropertyNumericPrice,
  getPropertyAddress,
  getPropertySuburb,
  getPropertyType,
  getListingType,
  getPropertyBedrooms,
  getPropertyBathrooms,
  getPropertyGarages,
  getPropertyLandArea,
  getPropertyFloorArea,
  getPropertyImages,
  getPropertyAgent,
} from '../../utils/propertyHelper';
import { getCachedProperty, cacheProperty } from '../../utils/propertyCache';

const { width } = Dimensions.get('window');

const NEARBY_SCHOOLS = [
  { name: 'Local Public School', type: 'Public Primary', rating: '4.8', distance: '0.8 km' },
  { name: 'High School Academy', type: 'Public Secondary', rating: '4.5', distance: '1.2 km' },
  { name: 'Grammar College', type: 'Private Co-ed', rating: '4.9', distance: '1.6 km' },
];

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, toggleSavedProperty, isSaved } = useAuth();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const cached = getCachedProperty(id);
  const [property, setProperty] = useState<any | null>(cached);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(!cached);

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    const initial = getCachedProperty(id);
    if (initial) {
      setProperty(initial);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const loadDetail = async () => {
      try {
        const propPromise = fetchPropertyById(id);
        const simPromise = fetchSimilarProperties(id).catch(() => ({ data: { success: false } }));

        const res = await propPromise;
        if (res.data?.success && res.data.property) {
          setProperty(res.data.property);
          cacheProperty(res.data.property);
        }
        // Immediately dismiss loading state once property details arrive
        setLoading(false);

        // Populate similar properties in background without blocking
        const simRes = await simPromise;
        if (simRes.data?.success && simRes.data.properties) {
          setSimilarProperties(simRes.data.properties);
        }
      } catch (err) {
        console.error('Failed to load property details', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  const handleCallAgent = (phone?: string) => {
    const num = phone || '+61480089451';
    Linking.openURL(`tel:${num}`);
  };

  const handleOpenEnquiry = () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to your buyer account to send a property enquiry to the agent.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/login' as any) },
        ]
      );
      return;
    }

    if (user.role && user.role !== 'buyer' && user.role !== 'admin') {
      Alert.alert(
        'Buyer Access Only',
        'Only registered buyer accounts can send property enquiries to agents.'
      );
      return;
    }

    setEnquiryModalOpen(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AuraColors.primary} />
        <Text style={styles.loadingText}>Loading Property Details...</Text>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={AuraColors.rose} />
        <Text style={styles.notFoundTitle}>Property Not Found</Text>
        <Pressable
          style={styles.backHomeBtn}
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backHomeBtnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const propId = getPropertyId(property);
  const saved = isSaved(propId);
  const images = getPropertyImages(property);
  const formattedPrice = getPropertyPrice(property);
  const numericPrice = getPropertyNumericPrice(property);
  const title = getPropertyTitle(property);
  const address = getPropertyAddress(property);
  const suburb = getPropertySuburb(property);
  const propertyType = getPropertyType(property);
  const listingType = getListingType(property);
  const bedrooms = getPropertyBedrooms(property);
  const bathrooms = getPropertyBathrooms(property);
  const garages = getPropertyGarages(property);
  const landArea = getPropertyLandArea(property);
  const floorArea = getPropertyFloorArea(property);
  const agent = getPropertyAgent(property);

  const topNavOffset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 20
  ) + 8;

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      {/* Top Floating Nav Bar */}
      <View style={[styles.topNav, { top: topNavOffset }]}>
        <Pressable
          style={styles.navCircleBtn}
          onPress={handleBack}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={AuraColors.text} />
        </Pressable>
        <Pressable
          style={[styles.navCircleBtn, saved && styles.navCircleBtnSaved]}
          onPress={() => toggleSavedProperty(propId)}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          accessibilityRole="button"
          accessibilityLabel="Save property"
        >
          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={22} color={saved ? '#ffffff' : AuraColors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Image Gallery Carousel */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveImage(Math.round(x / width));
            }}
            scrollEventThrottle={16}
          >
            {images.map((img: string, i: number) => (
              <Image key={i} source={{ uri: img }} style={styles.galleryMainImage} resizeMode="cover" />
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {images.map((_: any, i: number) => (
              <View key={i} style={[styles.dot, activeImage === i && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Header Details */}
        <View style={styles.headerSection}>
          <View style={styles.badgeRow}>
            <View style={styles.listingBadge}>
              <Text style={styles.listingBadgeText}>
                {listingType === 'Sale' ? 'BUY' : listingType.toUpperCase()} • {propertyType}
              </Text>
            </View>
            <Text style={styles.priceText}>{formattedPrice}</Text>
          </View>

          <Text style={styles.titleText}>{title}</Text>

          <View style={styles.addressRow}>
            <Ionicons name="location" size={16} color={AuraColors.primary} />
            <Text style={styles.addressText}>
              {address}
            </Text>
          </View>
        </View>

        {/* Key Specs Bar */}
        <View style={styles.specsBar}>
          <View style={styles.specColumn}>
            <Ionicons name="bed-outline" size={18} color={AuraColors.primary} />
            <Text style={styles.specVal} numberOfLines={1}>{bedrooms}</Text>
            <Text style={styles.specUnit}>Beds</Text>
          </View>
          <View style={styles.specDivider} />
          <View style={styles.specColumn}>
            <Ionicons name="water-outline" size={18} color={AuraColors.primary} />
            <Text style={styles.specVal} numberOfLines={1}>{bathrooms}</Text>
            <Text style={styles.specUnit}>Baths</Text>
          </View>
          <View style={styles.specDivider} />
          <View style={styles.specColumn}>
            <Ionicons name="car-outline" size={18} color={AuraColors.primary} />
            <Text style={styles.specVal} numberOfLines={1}>{garages}</Text>
            <Text style={styles.specUnit}>{garages > 1 ? 'Cars' : 'Car'}</Text>
          </View>
          <View style={styles.specDivider} />
          {landArea ? (
            <View style={styles.specColumn}>
              <Ionicons name="scan-outline" size={18} color={AuraColors.primary} />
              <Text style={styles.specVal} numberOfLines={1} ellipsizeMode="tail">{landArea}</Text>
              <Text style={styles.specUnit}>Land</Text>
            </View>
          ) : floorArea ? (
            <View style={styles.specColumn}>
              <Ionicons name="business-outline" size={18} color={AuraColors.primary} />
              <Text style={styles.specVal} numberOfLines={1} ellipsizeMode="tail">{floorArea}</Text>
              <Text style={styles.specUnit}>Floor</Text>
            </View>
          ) : (
            <View style={styles.specColumn}>
              <Ionicons name="scan-outline" size={18} color={AuraColors.primary} />
              <Text style={styles.specVal} numberOfLines={1}>Modern</Text>
              <Text style={styles.specUnit}>Design</Text>
            </View>
          )}
          <View style={styles.specDivider} />
          <View style={styles.specColumn}>
            <Ionicons name="calendar-outline" size={18} color={AuraColors.primary} />
            <Text style={styles.specVal} numberOfLines={1}>{property.yearBuilt || '2024'}</Text>
            <Text style={styles.specUnit}>Built</Text>
          </View>
        </View>


        {/* Inspection Schedule */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="time-outline" size={20} color={AuraColors.emerald} />
            <Text style={styles.cardHeaderTitle}>Upcoming Inspection Times</Text>
          </View>
          <View style={styles.inspectionSlot}>
            <View>
              <Text style={styles.slotDay}>Saturday, 21 Aug</Text>
              <Text style={styles.slotHours}>10:00 AM - 10:30 AM</Text>
            </View>
            <Pressable style={styles.bookSlotBtn} onPress={() => setBookingModalOpen(true)}>
              <Text style={styles.bookSlotBtnText}>Book Private Slot</Text>
            </Pressable>
          </View>
          <View style={styles.inspectionSlot}>
            <View>
              <Text style={styles.slotDay}>Wednesday, 25 Aug</Text>
              <Text style={styles.slotHours}>05:00 PM - 05:30 PM</Text>
            </View>
            <Pressable style={styles.bookSlotBtn} onPress={() => setBookingModalOpen(true)}>
              <Text style={styles.bookSlotBtnText}>Book Private Slot</Text>
            </Pressable>
          </View>
        </View>

        {/* About Property */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About the Property</Text>
          <Text style={styles.descriptionText}>
            {property.description || property.ai_description || 'Stunning luxury residence in prime location.'}
          </Text>
        </View>

        {/* Property Attributes Table */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Property Type</Text>
            <Text style={styles.tableValue}>{propertyType}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Listing Intent</Text>
            <Text style={styles.tableValue}>{listingType}</Text>
          </View>
          {landArea ? (
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Land Size</Text>
              <Text style={styles.tableValue}>{landArea}</Text>
            </View>
          ) : floorArea ? (
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Floor Size</Text>
              <Text style={styles.tableValue}>{floorArea}</Text>
            </View>
          ) : null}
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Council Rates</Text>
            <Text style={styles.tableValue}>$450 / quarter (approx)</Text>
          </View>
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.tableLabel}>Year Built</Text>
            <Text style={styles.tableValue}>{property.yearBuilt || '2024'}</Text>
          </View>
        </View>

        {/* Features Checklist */}
        {property.features && property.features.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Features & Amenities</Text>
            <View style={styles.featuresGrid}>
              {property.features.map((f: string, i: number) => (
                <View key={i} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={AuraColors.primary} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Nearby Schools */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="school-outline" size={20} color={AuraColors.primary} />
            <Text style={styles.cardHeaderTitle}>Nearby Schools & Education</Text>
          </View>
          {NEARBY_SCHOOLS.map((school, i) => (
            <View key={i} style={styles.schoolItem}>
              <View>
                <Text style={styles.schoolName}>{school.name}</Text>
                <Text style={styles.schoolType}>{school.type}</Text>
              </View>
              <View style={styles.schoolRight}>
                <Text style={styles.schoolDist}>{school.distance}</Text>
                <Text style={styles.schoolRating}>⭐ {school.rating}/5</Text>
              </View>
            </View>
          ))}
        </View>


        {/* Agent Contact Card */}
        <View style={styles.agentCard}>
          <Image source={{ uri: agent.avatar }} style={styles.agentAvatar} />
          <View style={styles.agentInfo}>
            <Text style={styles.agentName}>{agent.name}</Text>
            <Text style={styles.agentRole}>{agent.agency}</Text>
          </View>
          <View style={styles.agentActionsRow}>
            <Pressable style={styles.agentCallBtn} onPress={() => handleCallAgent(agent.phone)}>
              <Ionicons name="call" size={16} color={AuraColors.text} />
              <Text style={styles.agentCallBtnText}>Call</Text>
            </Pressable>
            <Pressable style={styles.agentMsgBtn} onPress={handleOpenEnquiry}>
              <Ionicons name="mail" size={16} color="#ffffff" />
              <Text style={styles.agentMsgBtnText}>Send Enquiry</Text>
            </Pressable>
          </View>
        </View>


        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <View style={styles.similarSection}>
            <Text style={styles.sectionTitle}>Similar Properties</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {similarProperties.map((p) => (
                <PropertyCard key={getPropertyId(p)} property={p} compact />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <InspectionBookingModal
        visible={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        property={property}
      />
      <EnquiryModal
        visible={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        property={property}
        agent={agent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: AuraColors.textMuted,
    fontWeight: '600',
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AuraColors.text,
  },
  backHomeBtn: {
    backgroundColor: AuraColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  backHomeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  topNav: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
    elevation: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  navCircleBtnSaved: {
    backgroundColor: AuraColors.rose,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  galleryContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
    backgroundColor: '#0f172a',
  },
  galleryMainImage: {
    width: width,
    height: 280,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    width: 18,
    backgroundColor: AuraColors.primary,
  },
  headerSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listingBadge: {
    backgroundColor: AuraColors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  listingBadgeText: {
    color: AuraColors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  priceText: {
    fontSize: 22,
    fontWeight: '900',
    color: AuraColors.primaryDark,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '900',
    color: AuraColors.text,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    fontSize: 13,
    color: AuraColors.textMuted,
    fontWeight: '500',
    flex: 1,
  },
  specsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  specColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  specDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#e2e8f0',
  },
  specVal: {
    fontSize: 13,
    fontWeight: '800',
    color: AuraColors.text,
    marginTop: 3,
    textAlign: 'center',
  },
  specUnit: {
    fontSize: 10,
    color: AuraColors.textMuted,
    fontWeight: '600',
    marginTop: 1,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AuraColors.text,
  },
  inspectionSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  slotDay: {
    fontSize: 13,
    fontWeight: '800',
    color: AuraColors.text,
  },
  slotHours: {
    fontSize: 11,
    color: AuraColors.textMuted,
    marginTop: 2,
  },
  bookSlotBtn: {
    backgroundColor: AuraColors.emeraldLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AuraColors.emeraldBorder,
  },
  bookSlotBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AuraColors.emerald,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AuraColors.text,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 13,
    color: AuraColors.textSecondary,
    lineHeight: 20,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableLabel: {
    fontSize: 12,
    color: AuraColors.textMuted,
  },
  tableValue: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.text,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  featureText: {
    fontSize: 12,
    color: AuraColors.textSecondary,
    fontWeight: '600',
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
    fontSize: 10,
    color: AuraColors.textMuted,
    marginTop: 1,
  },
  schoolRight: {
    alignItems: 'flex-end',
  },
  schoolDist: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.text,
  },
  schoolRating: {
    fontSize: 10,
    color: AuraColors.amber,
    marginTop: 1,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  agentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e2e8f0',
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '800',
    color: AuraColors.text,
  },
  agentRole: {
    fontSize: 11,
    color: AuraColors.primaryDark,
    fontWeight: '600',
  },
  agentActionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  agentCallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agentCallBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AuraColors.text,
  },
  agentMsgBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: AuraColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agentMsgBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  similarSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
});

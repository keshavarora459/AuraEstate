import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { ParsedProperty } from '../../utils/aiResponseParser';
import { findCachedProperty, cacheSyntheticProperty } from '../../utils/propertyCache';

const LUXURY_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=800',
];

interface AIPropertyCardProps {
  property: ParsedProperty;
  isSingle?: boolean;
  highlightTitle?: string;
  onPress?: () => void;
}

export const AIPropertyCard: React.FC<AIPropertyCardProps> = ({
  property,
  isSingle = false,
  highlightTitle,
  onPress,
}) => {
  const router = useRouter();

  // Determine fallback image based on id or hash
  const imageIndex = Math.abs(
    (property.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  ) % LUXURY_FALLBACK_IMAGES.length;
  const fallbackImg = LUXURY_FALLBACK_IMAGES[imageIndex];

  // Retrieve cached property or register synthetic property for seamless offline/mock navigation
  const [cachedData] = useState<any>(() => {
    const existing = findCachedProperty(property.id, property.title);
    if (existing) return existing;
    return cacheSyntheticProperty(property, fallbackImg);
  });

  const displayImage =
    property.image ||
    cachedData?.images?.[0] ||
    cachedData?.image ||
    fallbackImg;

  const displayTitle = property.title || cachedData?.title || 'Luxury Prestige Residence';
  const displayPrice = property.price || (cachedData?.price ? `AUD $${cachedData.price.toLocaleString()}` : 'Contact Agent');
  const displayLocation =
    property.location ||
    (cachedData?.address?.suburb
      ? `${cachedData.address.suburb}${cachedData.address.state ? `, ${cachedData.address.state}` : ''}`
      : 'Sydney, NSW');
  const displayBeds = property.beds ?? cachedData?.bedrooms ?? 4;
  const displayBaths = property.baths ?? cachedData?.bathrooms ?? 3;
  const displayType = property.type || cachedData?.propertyType || 'Luxury Residence';
  const isRent = displayPrice.toLowerCase().includes('/wk') || displayPrice.toLowerCase().includes('/week') || cachedData?.listingType === 'Rent';

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      const targetId = cachedData?._id || cachedData?.id || property.id;
      if (targetId) {
        cacheSyntheticProperty(property, fallbackImg);
        router.push(`/property/${targetId}` as any);
      }
    }
  };


  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isSingle && styles.singleCard,
        pressed && styles.cardPressed,
      ]}
      onPress={handlePress}
    >
      {/* Optional Highlight Badge for single / cheapest properties */}
      {isSingle && highlightTitle && (
        <View style={styles.singleHeader}>
          <View style={styles.highlightBadge}>
            <Ionicons
              name={property.isCheapest ? 'pricetag' : 'sparkles'}
              size={12}
              color={property.isCheapest ? '#047857' : AuraColors.primaryDark}
            />
            <Text style={[styles.highlightBadgeText, property.isCheapest && styles.cheapestBadgeText]}>
              {highlightTitle}
            </Text>
          </View>
        </View>
      )}

      {/* Property Image with Badges */}
      <View style={[styles.imageWrapper, isSingle && styles.singleImageWrapper]}>
        <Image source={{ uri: displayImage }} style={styles.image} resizeMode="cover" />
        <View style={styles.imageOverlay} />

        {/* Top Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, isRent ? styles.rentBadge : styles.buyBadge]}>
            <Text style={styles.typeBadgeText}>{isRent ? 'RENT' : 'BUY'}</Text>
          </View>
          <View style={styles.suburbBadge}>
            <Text style={styles.suburbBadgeText}>{displayType}</Text>
          </View>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.body}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {displayTitle}
        </Text>

        {/* Location Row */}
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={13} color={AuraColors.primaryDark} />
          <Text style={styles.locationText} numberOfLines={1}>
            {displayLocation}
          </Text>
        </View>

        {/* Specs Pill Row */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="bed-outline" size={14} color={AuraColors.textSecondary} />
            <Text style={styles.specText}>{displayBeds} beds</Text>
          </View>
          <View style={styles.specDivider} />
          <View style={styles.specItem}>
            <Ionicons name="water-outline" size={14} color={AuraColors.textSecondary} />
            <Text style={styles.specText}>{displayBaths} baths</Text>
          </View>
        </View>

        {/* Price & Action Row */}
        <View style={styles.bottomRow}>
          <View style={styles.priceWrap}>
            <Text style={styles.priceLabel}>PRICE</Text>
            <Text style={styles.priceText} numberOfLines={1}>
              {displayPrice}
            </Text>
          </View>

          <View style={styles.viewBtn}>
            <Text style={styles.viewBtnText}>View Property</Text>
            <Ionicons name="arrow-forward" size={13} color="#ffffff" />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  singleCard: {
    borderColor: '#bae6fd',
    borderWidth: 1.5,
  },
  singleHeader: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#f0f9ff',
  },
  highlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  highlightBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: AuraColors.primaryDark,
    letterSpacing: 0.3,
  },
  cheapestBadgeText: {
    color: '#047857',
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  imageWrapper: {
    width: '100%',
    height: 145,
    position: 'relative',
    backgroundColor: '#e2e8f0',
  },
  singleImageWrapper: {
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  badgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  buyBadge: {
    backgroundColor: AuraColors.primaryDark,
  },
  rentBadge: {
    backgroundColor: AuraColors.emerald,
  },
  typeBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  suburbBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  suburbBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: AuraColors.text,
    lineHeight: 19,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: AuraColors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 12,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#cbd5e1',
  },
  specText: {
    fontSize: 11,
    color: AuraColors.textSecondary,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceWrap: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: AuraColors.textLight,
    letterSpacing: 0.5,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '900',
    color: AuraColors.primaryDark,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AuraColors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  viewBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
});

import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

import {
  getPropertyId,
  getPropertyTitle,
  getPropertyPrice,
  getPropertyAddress,
  getPropertyType,
  getListingType,
  getPropertyBedrooms,
  getPropertyBathrooms,
  getPropertyGarages,
  getPropertyLandArea,
  getPropertyImages,
} from '../utils/propertyHelper';
import { cacheProperty, getCachedProperty } from '../utils/propertyCache';

interface PropertyCardProps {
  property: any;
  compact?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property: initialProperty, compact = false }) => {
  const router = useRouter();
  const { toggleSavedProperty, isSaved } = useAuth();

  const id = getPropertyId(initialProperty);
  const cached = id ? getCachedProperty(id) : null;
  const property = (initialProperty?.title || initialProperty?.street_address) ? initialProperty : (cached || initialProperty);

  if (property && (property.title || property.street_address)) {
    cacheProperty(property);
  }
  const saved = isSaved(id);

  const images = getPropertyImages(property);
  const imageUrl = images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800';

  const title = getPropertyTitle(property);
  const priceDisplay = getPropertyPrice(property);
  const addressDisplay = getPropertyAddress(property);
  const propType = getPropertyType(property);
  const listingType = getListingType(property);
  const isSold = listingType === 'Sold';

  const bedrooms = getPropertyBedrooms(property);
  const bathrooms = getPropertyBathrooms(property);
  const garages = getPropertyGarages(property);
  const landArea = getPropertyLandArea(property);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        compact && styles.compactCard,
        pressed && styles.cardPressed,
      ]}
      onPress={() => {
        cacheProperty(property);
        router.push(`/property/${id}` as any);
      }}
    >
      {/* Image Container */}
      <View style={[styles.imageContainer, compact && styles.compactImageContainer]}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.overlayGradient} />

        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, isSold ? styles.soldBadge : styles.listingTypeBadge]}>
            <Text style={[styles.badgeText, isSold ? styles.soldBadgeText : styles.listingTypeBadgeText]}>
              {isSold ? 'SOLD' : listingType === 'Sale' ? 'BUY' : listingType.toUpperCase()}
            </Text>
          </View>
          {propType && (
            <View style={styles.propTypeBadge}>
              <Text style={styles.propTypeBadgeText}>{propType}</Text>
            </View>
          )}
        </View>

        {/* Heart Wishlist Button */}
        <Pressable
          style={[styles.heartButton, saved && styles.heartButtonActive]}
          onPress={(e) => {
            e.stopPropagation?.();
            toggleSavedProperty(id);
          }}
          hitSlop={8}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={18}
            color={saved ? '#ffffff' : AuraColors.dark}
          />
        </Pressable>
      </View>

      {/* Content Body */}
      <View style={styles.body}>
        {/* Price */}
        <Text style={styles.priceText}>{priceDisplay}</Text>

        {/* Title */}
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={14} color={AuraColors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {addressDisplay}
          </Text>
        </View>

        {/* Specs Row */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="bed-outline" size={15} color={AuraColors.textMuted} />
            <Text style={styles.specText}>{bedrooms} Beds</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="water-outline" size={15} color={AuraColors.textMuted} />
            <Text style={styles.specText}>{bathrooms} Baths</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="car-outline" size={15} color={AuraColors.textMuted} />
            <Text style={styles.specText}>{garages} {garages > 1 ? 'Cars' : 'Car'}</Text>
          </View>
          {landArea && (
            <View style={styles.specItem}>
              <Ionicons name="scan-outline" size={15} color={AuraColors.textMuted} />
              <Text style={styles.specText}>{landArea}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuraColors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  compactCard: {
    width: 260,
    marginRight: 14,
    marginBottom: 8,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: '#e2e8f0',
  },
  compactImageContainer: {
    height: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
  },
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  listingTypeBadge: {
    backgroundColor: 'rgba(14, 165, 233, 0.92)',
  },
  listingTypeBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  soldBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
  },
  soldBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  propTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  propTypeBadgeText: {
    color: AuraColors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heartButtonActive: {
    backgroundColor: AuraColors.rose,
  },
  body: {
    padding: 14,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
    color: AuraColors.primaryDark,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: AuraColors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: AuraColors.textMuted,
    fontWeight: '500',
    flex: 1,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 11,
    fontWeight: '600',
    color: AuraColors.textSecondary,
  },
});

export default PropertyCard;

import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

interface PropertyCardProps {
  property: {
    _id: string;
    title: string;
    price?: number;
    pricePeriod?: string;
    listingType?: string;
    propertyType?: string;
    address?: {
      street?: string;
      suburb?: string;
      city?: string;
      state?: string;
      postcode?: string;
    };
    bedrooms?: number;
    bathrooms?: number;
    parkingSpaces?: number;
    landArea?: number;
    images?: string[];
    tier?: string;
    status?: string;
  };
  compact?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, compact = false }) => {
  const router = useRouter();
  const { toggleSavedProperty, isSaved } = useAuth();
  const saved = isSaved(property._id);

  const fallbackImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800';
  const imageUrl = property.images && property.images.length > 0 ? property.images[0] : fallbackImage;

  const formatPrice = () => {
    if (!property.price) return 'Contact Agent';
    const num = property.price.toLocaleString();
    if (property.listingType === 'Rent' || property.pricePeriod === 'weekly') {
      return `$${num} / wk`;
    }
    return `$${num}`;
  };

  const isSold = property.status === 'Sold';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        compact && styles.compactCard,
        pressed && styles.cardPressed,
      ]}
      onPress={() => router.push(`/property/${property._id}` as any)}
    >
      {/* Image Container */}
      <View style={[styles.imageContainer, compact && styles.compactImageContainer]}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.overlayGradient} />

        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, isSold ? styles.soldBadge : styles.listingTypeBadge]}>
            <Text style={[styles.badgeText, isSold ? styles.soldBadgeText : styles.listingTypeBadgeText]}>
              {isSold ? 'SOLD' : property.listingType === 'Sale' ? 'BUY' : property.listingType || 'FOR SALE'}
            </Text>
          </View>
          {property.propertyType && (
            <View style={styles.propTypeBadge}>
              <Text style={styles.propTypeBadgeText}>{property.propertyType}</Text>
            </View>
          )}
        </View>

        {/* Heart Wishlist Button */}
        <Pressable
          style={[styles.heartButton, saved && styles.heartButtonActive]}
          onPress={(e) => {
            e.stopPropagation?.();
            toggleSavedProperty(property._id);
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
        <Text style={styles.priceText}>{formatPrice()}</Text>

        {/* Title */}
        <Text style={styles.titleText} numberOfLines={1}>
          {property.title}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={14} color={AuraColors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {property.address?.suburb
              ? `${property.address?.suburb}, ${property.address?.state || 'Australia'}`
              : 'Australia'}
          </Text>
        </View>

        {/* Specs Row */}
        <View style={styles.specsRow}>
          {property.bedrooms !== undefined && (
            <View style={styles.specItem}>
              <Ionicons name="bed-outline" size={15} color={AuraColors.textMuted} />
              <Text style={styles.specText}>{property.bedrooms} Beds</Text>
            </View>
          )}
          {property.bathrooms !== undefined && (
            <View style={styles.specItem}>
              <Ionicons name="water-outline" size={15} color={AuraColors.textMuted} />
              <Text style={styles.specText}>{property.bathrooms} Baths</Text>
            </View>
          )}
          {property.parkingSpaces !== undefined && (
            <View style={styles.specItem}>
              <Ionicons name="car-outline" size={15} color={AuraColors.textMuted} />
              <Text style={styles.specText}>{property.parkingSpaces} Cars</Text>
            </View>
          )}
          {property.landArea !== undefined && property.landArea > 0 && (
            <View style={styles.specItem}>
              <Ionicons name="scan-outline" size={15} color={AuraColors.textMuted} />
              <Text style={styles.specText}>{property.landArea}m²</Text>
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

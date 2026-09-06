import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import PropertyCard from '../../components/PropertyCard';

export default function WishlistScreen() {
  const router = useRouter();
  const { savedProperties, user, openAuthModal } = useAuth();

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.badgeRow}>
            <Ionicons name="heart" size={14} color={AuraColors.rose} />
            <Text style={styles.badgeText}>FAVORITE LUXURY PORTFOLIO</Text>
          </View>
          <Text style={styles.headerTitle}>Saved Wishlist</Text>
          <Text style={styles.headerSubtitle}>
            {savedProperties.length} Saved {savedProperties.length === 1 ? 'Property' : 'Properties'}
          </Text>
        </View>

        <Pressable style={styles.exploreBtn} onPress={() => router.push('/explore' as any)}>
          <Ionicons name="search" size={16} color={AuraColors.primaryDark} />
          <Text style={styles.exploreBtnText}>Browse</Text>
        </Pressable>
      </View>

      {!user ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: AuraColors.primaryLight }]}>
            <Ionicons name="lock-closed" size={36} color={AuraColors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Sign In to View Wishlist</Text>
          <Text style={styles.emptySubtitle}>
            Save luxury villas, penthouses, and townhouses to review, track price changes, or schedule private inspections.
          </Text>
          <Pressable style={styles.actionBtn} onPress={() => openAuthModal('Sign in to view your saved wishlist')}>
            <Text style={styles.actionBtnText}>Sign In / Register</Text>
          </Pressable>
        </View>
      ) : savedProperties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={44} color={AuraColors.rose} />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any property to save it to your private portfolio.
          </Text>
          <Pressable style={styles.actionBtn} onPress={() => router.push('/explore' as any)}>
            <Text style={styles.actionBtnText}>Explore Properties Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#ffffff" />
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={savedProperties}
          keyExtractor={(item) => (typeof item === 'object' ? item._id : item)}
          renderItem={({ item }) => (
            <PropertyCard
              property={
                typeof item === 'object'
                  ? item
                  : {
                      _id: item,
                      title: 'Saved Luxury Property',
                      price: 1850000,
                      listingType: 'Sale',
                      address: { suburb: 'Sydney', state: 'NSW' },
                    }
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: AuraColors.rose,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: AuraColors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: AuraColors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AuraColors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  exploreBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: AuraColors.primaryDark,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AuraColors.roseLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
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
    maxWidth: 280,
  },
  actionBtn: {
    backgroundColor: AuraColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 10,
    shadowColor: AuraColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
});

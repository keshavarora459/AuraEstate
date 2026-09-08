import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

interface BuyPropertyModalProps {
  visible: boolean;
  onClose: () => void;
  property: any;
  onSelectOffer: () => void;
  onSelectReserve: () => void;
}

export default function BuyPropertyModal({
  visible,
  onClose,
  property,
  onSelectOffer,
  onSelectReserve,
}: BuyPropertyModalProps) {
  const { user } = useAuth();

  if (!property) return null;

  const title = property.title || 'Luxury Property';
  const priceDisplay =
    typeof property.price === 'number'
      ? `$${property.price.toLocaleString()}`
      : property.price || 'Contact Agent';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <Ionicons name="cart" size={14} color={AuraColors.primaryDark} />
                <Text style={styles.badgeText}>BUYER ACQUISITION</Text>
              </View>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.priceText}>{priceDisplay}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
              <Ionicons name="close" size={22} color={AuraColors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Buyer Profile Verification Strip */}
            <View style={styles.buyerStrip}>
              <View style={styles.buyerAvatar}>
                <Ionicons name="person" size={16} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.buyerName}>{user?.name || 'Registered Buyer'}</Text>
                <Text style={styles.buyerEmail}>{user?.email || 'buyer@gmail.com'}</Text>
              </View>
              <View style={styles.verifiedTag}>
                <Ionicons name="checkmark-circle" size={12} color={AuraColors.emerald} />
                <Text style={styles.verifiedText}>Verified Buyer</Text>
              </View>
            </View>

            <Text style={styles.sectionHeading}>SELECT BUYING METHOD</Text>

            {/* Option 1: Formal Purchase Offer */}
            <Pressable
              style={styles.optionCard}
              onPress={() => {
                onClose();
                onSelectOffer();
              }}
            >
              <View style={[styles.optionIconWrap, { backgroundColor: AuraColors.primaryLight }]}>
                <Ionicons name="document-text" size={24} color={AuraColors.primaryDark} />
              </View>
              <View style={styles.optionContent}>
                <View style={styles.optionTopRow}>
                  <Text style={styles.optionTitle}>Submit Purchase Offer</Text>
                  <View style={styles.recommendBadge}>
                    <Text style={styles.recommendText}>MOST POPULAR</Text>
                  </View>
                </View>
                <Text style={styles.optionDesc}>
                  Propose your offer price, initial deposit, and settlement conditions (finance approval & pest inspection).
                </Text>
                <View style={styles.optionActionRow}>
                  <Text style={styles.optionActionText}>Make Digital Offer</Text>
                  <Ionicons name="arrow-forward" size={14} color={AuraColors.primary} />
                </View>
              </View>
            </Pressable>

            {/* Option 2: Instant Holding Deposit */}
            <Pressable
              style={styles.optionCard}
              onPress={() => {
                onClose();
                onSelectReserve();
              }}
            >
              <View style={[styles.optionIconWrap, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="lock-closed" size={24} color="#d97706" />
              </View>
              <View style={styles.optionContent}>
                <View style={styles.optionTopRow}>
                  <Text style={styles.optionTitle}>Reserve with Holding Deposit</Text>
                  <View style={[styles.recommendBadge, { backgroundColor: '#fef3c7' }]}>
                    <Text style={[styles.recommendText, { color: '#b45309' }]}>$5,000 AUD</Text>
                  </View>
                </View>
                <Text style={styles.optionDesc}>
                  Lock this property exclusively for 14 days with an official refundable escrow holding deposit.
                </Text>
                <View style={styles.optionActionRow}>
                  <Text style={[styles.optionActionText, { color: '#d97706' }]}>Pay Deposit & Reserve</Text>
                  <Ionicons name="arrow-forward" size={14} color="#d97706" />
                </View>
              </View>
            </Pressable>

            {/* Trust Assurance Info */}
            <View style={styles.trustBox}>
              <Ionicons name="shield-checkmark-outline" size={18} color={AuraColors.primaryDark} />
              <Text style={styles.trustText}>
                All offers and deposits are handled through accredited Australian real estate contracts and verified trust accounts.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '82%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: AuraColors.primaryDark,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: AuraColors.text,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: AuraColors.primaryDark,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  buyerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  buyerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AuraColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyerName: {
    fontSize: 13,
    fontWeight: '800',
    color: AuraColors.text,
  },
  buyerEmail: {
    fontSize: 11,
    color: AuraColors.textMuted,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: AuraColors.emerald,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: AuraColors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  optionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AuraColors.text,
    flex: 1,
  },
  recommendBadge: {
    backgroundColor: AuraColors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 6,
  },
  recommendText: {
    fontSize: 9,
    fontWeight: '800',
    color: AuraColors.primaryDark,
    letterSpacing: 0.5,
  },
  optionDesc: {
    fontSize: 12,
    color: AuraColors.textMuted,
    lineHeight: 16,
    marginBottom: 8,
  },
  optionActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: AuraColors.primary,
  },
  trustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 6,
    marginBottom: 20,
  },
  trustText: {
    flex: 1,
    fontSize: 11,
    color: AuraColors.textMuted,
    lineHeight: 15,
  },
});

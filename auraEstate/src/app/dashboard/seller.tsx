import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
  fetchProperties,
  deleteProperty,
  fetchPaymentHistory,
  fetchOffers,
  respondOffer,
} from '@/services/api';
import { COLORS } from '@/constants/colors';
import AddPropertyModal from '@/components/AddPropertyModal';
import PaymentModal from '@/components/PaymentModal';
import AccessRestrictedView from '@/components/AccessRestrictedView';

export default function SellerDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const isAuthorized = !!user && (user.role === 'seller' || user.role === 'agent' || user.role === 'agency' || user.role === 'admin' || user.role === 'super_admin');

  const [properties, setProperties] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'properties' | 'offers' | 'payments'>('properties');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [paymentPackage, setPaymentPackage] = useState('Featured Listing');
  const [paymentAmount, setPaymentAmount] = useState(99);

  const loadData = async () => {
    try {
      const [pRes, txRes, oRes] = await Promise.all([
        fetchProperties({ ownerId: user?._id }).catch(() => ({ data: { success: false, properties: [] } })),
        fetchPaymentHistory().catch(() => ({ data: { success: false, transactions: [] } })),
        fetchOffers().catch(() => ({ data: { success: false, offers: [] } })),
      ]);

      if (pRes.data?.success) setProperties(pRes.data.properties || []);
      if (txRes.data?.success) setTransactions(txRes.data.transactions || []);
      if (oRes.data?.success) setOffers(oRes.data.offers || []);
    } catch (err) {
      console.error('Error loading seller dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, isAuthorized]);

  const onRefresh = () => {
    if (isAuthorized) {
      setRefreshing(true);
      loadData();
    }
  };

  if (!isAuthorized) {
    return (
      <AccessRestrictedView
        portalTitle="Seller Dashboard"
        requiredRoleLabel="Verified Seller"
        currentUserRole={user?.role}
      />
    );
  }

  const handlePropertyAdded = (newProperty: any) => {
    setProperties(prev => [newProperty, ...prev]);
    Alert.alert('Success', 'Your property listing has been successfully published!');
  };

  const handleDeleteProperty = (id: string) => {
    Alert.alert(
      'Remove Property',
      'Are you sure you want to permanently remove this property listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteProperty(id);
              if (res.data?.success) {
                setProperties(prev => prev.filter(p => p._id !== id));
              }
            } catch (err) {
              console.error('Error deleting property:', err);
            }
          },
        },
      ]
    );
  };

  const handleOfferAction = async (offerId: string, action: 'accept' | 'reject') => {
    try {
      const res = await respondOffer(offerId, { action });
      if (res.data?.success) {
        Alert.alert('Success', `Offer ${action === 'accept' ? 'accepted' : 'rejected'} successfully.`);
        loadData();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update offer status');
    }
  };

  const handleOpenPayment = (propId: string | null, pkg: string, amt: number) => {
    setSelectedPropertyId(propId);
    setPaymentPackage(pkg);
    setPaymentAmount(amt);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (tx: any) => {
    setTransactions(prev => [tx, ...prev]);
    setIsPaymentModalOpen(false);
    loadData();
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.badgeText}>FSBO SELLER PORTAL</Text>
          <Text style={styles.headerTitle}>Seller Operations</Text>
        </View>
        <TouchableOpacity
          style={styles.addPropertyBtn}
          onPress={() => setIsAddModalOpen(true)}
        >
          <Ionicons name="add" size={18} color="#ffffff" />
          <Text style={styles.addPropertyBtnText}>Add Property</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'properties' && styles.tabBtnActive]}
            onPress={() => setActiveTab('properties')}
          >
            <Text style={[styles.tabText, activeTab === 'properties' && styles.tabTextActive]}>
              Properties ({properties.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'offers' && styles.tabBtnActive]}
            onPress={() => setActiveTab('offers')}
          >
            <Text style={[styles.tabText, activeTab === 'offers' && styles.tabTextActive]}>
              Offers ({offers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'payments' && styles.tabBtnActive]}
            onPress={() => setActiveTab('payments')}
          >
            <Text style={[styles.tabText, activeTab === 'payments' && styles.tabTextActive]}>
              Transactions ({transactions.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollBody}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* TAB: PROPERTIES */}
            {activeTab === 'properties' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Your Listed Properties</Text>
                  <Text style={styles.sectionCounter}>Total: {properties.length}</Text>
                </View>

                {properties.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="home-outline" size={42} color={COLORS.textMuted} />
                    <Text style={styles.emptyTitle}>No Properties Listed Yet</Text>
                    <Text style={styles.emptySubtitle}>
                      List your residential or commercial property directly to thousands of high-net-worth buyers.
                    </Text>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => setIsAddModalOpen(true)}
                    >
                      <Ionicons name="add" size={16} color="#ffffff" />
                      <Text style={styles.actionBtnText}>Add First Listing</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  properties.map((prop) => (
                    <View key={prop._id} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        {prop.images?.[0] ? (
                          <Image source={{ uri: prop.images[0] }} style={styles.itemImage} />
                        ) : (
                          <View style={[styles.itemImage, styles.imagePlaceholder]}>
                            <Ionicons name="business" size={24} color={COLORS.textMuted} />
                          </View>
                        )}
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.itemTitle} numberOfLines={1}>{prop.title}</Text>
                          <Text style={styles.itemAmount}>${prop.price?.toLocaleString()}</Text>
                          <Text style={styles.itemAddress} numberOfLines={1}>
                            📍 {prop.address?.street}, {prop.address?.suburb}
                          </Text>
                          <Text style={styles.itemSubtext}>
                            Type: {prop.type} • Status: {prop.status || 'Active'}
                          </Text>
                        </View>
                      </View>

                      {/* Action buttons */}
                      <View style={styles.itemFooter}>
                        <TouchableOpacity
                          style={styles.boostBtn}
                          onPress={() => handleOpenPayment(prop._id, 'Featured Listing', 99)}
                        >
                          <Ionicons name="sparkles" size={12} color={COLORS.primary} />
                          <Text style={styles.boostBtnText}>Boost Listing ($99)</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            style={styles.viewBtn}
                            onPress={() => router.push(`/property/${prop._id}` as any)}
                          >
                            <Ionicons name="eye-outline" size={14} color={COLORS.textPrimary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDeleteProperty(prop._id)}
                          >
                            <Ionicons name="trash-outline" size={14} color={COLORS.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* TAB: OFFERS */}
            {activeTab === 'offers' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Received Purchase Proposals</Text>
                  <Text style={styles.sectionCounter}>Total: {offers.length}</Text>
                </View>

                {offers.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="pricetag-outline" size={42} color={COLORS.textMuted} />
                    <Text style={styles.emptyTitle}>No Offers Received Yet</Text>
                    <Text style={styles.emptySubtitle}>
                      When prospective buyers submit purchase bids for your properties, they will appear here.
                    </Text>
                  </View>
                ) : (
                  offers.map((offer) => (
                    <View key={offer._id} style={styles.itemCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemTitle}>{offer.propertyId?.title || 'Property Offer'}</Text>
                          <Text style={styles.itemAmount}>
                            Offered: ${offer.offerAmount?.toLocaleString()}
                          </Text>
                          <Text style={styles.itemSubtext}>
                            Buyer: {offer.buyerId?.name || 'Verified Buyer'} ({offer.buyerId?.email || 'N/A'})
                          </Text>
                          <Text style={styles.itemSubtext}>
                            Conditions: {offer.conditions || 'Standard'}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statusPill,
                            offer.status === 'Accepted'
                              ? styles.statusAccepted
                              : offer.status === 'Rejected'
                              ? styles.statusRejected
                              : styles.statusPending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              offer.status === 'Accepted'
                                ? styles.statusAcceptedText
                                : offer.status === 'Rejected'
                                ? styles.statusRejectedText
                                : styles.statusPendingText,
                            ]}
                          >
                            {offer.status}
                          </Text>
                        </View>
                      </View>

                      {offer.status === 'Pending' && (
                        <View style={styles.offerActionRow}>
                          <TouchableOpacity
                            style={styles.acceptBtn}
                            onPress={() => handleOfferAction(offer._id, 'accept')}
                          >
                            <Ionicons name="checkmark-circle-outline" size={14} color="#ffffff" />
                            <Text style={styles.acceptBtnText}>Accept Offer</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => handleOfferAction(offer._id, 'reject')}
                          >
                            <Ionicons name="close-circle-outline" size={14} color={COLORS.error} />
                            <Text style={styles.rejectBtnText}>Decline</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}

            {/* TAB: PAYMENTS */}
            {activeTab === 'payments' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Promotion & Listing Invoices</Text>
                  <Text style={styles.sectionCounter}>Total: {transactions.length}</Text>
                </View>

                {transactions.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="card-outline" size={42} color={COLORS.textMuted} />
                    <Text style={styles.emptyTitle}>No Invoices</Text>
                    <Text style={styles.emptySubtitle}>
                      When you upgrade listings with featured badge placement, records will appear here.
                    </Text>
                  </View>
                ) : (
                  transactions.map((tx) => (
                    <View key={tx._id} style={styles.itemCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                          <Text style={styles.itemTitle}>{tx.package || 'Listing Upgrade'}</Text>
                          <Text style={styles.itemSubtext}>
                            Invoice #{tx._id?.substring(0, 8)} • {new Date(tx.createdAt || Date.now()).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.paymentAmountText}>${tx.amount?.toLocaleString()}</Text>
                          <Text style={styles.paymentMethodText}>{tx.paymentMethod?.toUpperCase()}</Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPropertyAdded={handlePropertyAdded}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        propertyId={selectedPropertyId}
        packageType={paymentPackage}
        amount={paymentAmount}
        onSuccess={handlePaymentSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  addPropertyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  addPropertyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
    backgroundColor: COLORS.cardDark,
  },
  tabsContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.bgDark,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 40,
  },
  tabSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionCounter: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  emptyCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  itemCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    gap: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  imagePlaceholder: {
    backgroundColor: COLORS.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  itemAddress: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: 10,
  },
  boostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
    gap: 4,
  },
  boostBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  viewBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPending: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  statusPendingText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  statusAccepted: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  statusAcceptedText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '700',
  },
  statusRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusRejectedText: {
    color: COLORS.error,
    fontSize: 11,
    fontWeight: '700',
  },
  offerActionRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: 10,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  acceptBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  rejectBtnText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '700',
  },
  paymentAmountText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.success,
  },
  paymentMethodText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

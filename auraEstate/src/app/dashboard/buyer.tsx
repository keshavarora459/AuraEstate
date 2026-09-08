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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { fetchBookings, fetchPaymentHistory } from '@/services/api';
import { COLORS } from '@/constants/colors';
import PaymentModal from '@/components/PaymentModal';
import AccessRestrictedView from '@/components/AccessRestrictedView';

export default function BuyerDashboardScreen() {
  const router = useRouter();
  const { user, loading: authLoading, savedProperties } = useAuth();

  const isAuthorized = !!user;

  const [bookings, setBookings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'wishlist' | 'payments'>('bookings');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [paymentPackage, setPaymentPackage] = useState('Holding Deposit');
  const [paymentAmount, setPaymentAmount] = useState(5000);

  const loadData = async () => {
    try {
      const [bRes, txRes] = await Promise.all([
        fetchBookings().catch(() => ({ data: { success: false, bookings: [] } })),
        fetchPaymentHistory().catch(() => ({ data: { success: false, transactions: [] } })),
      ]);
      if (bRes.data?.success) setBookings(bRes.data.bookings || []);
      if (txRes.data?.success) setTransactions(txRes.data.transactions || []);
    } catch (err) {
      console.error('Error loading buyer dashboard data:', err);
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
        portalTitle="Buyer & Renter Portal"
        requiredRoleLabel="Registered User"
        currentUserRole={user ? (user as any).role : null}
      />
    );
  }

  const handleOpenPayment = (propId: string | null = null, pkg = 'Holding Deposit', amt = 5000) => {
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
      {/* Top Header */}
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
          <Text style={styles.badgeText}>BUYER & RENTER PORTAL</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Property Portfolio
          </Text>
        </View>
        <TouchableOpacity
          style={styles.depositActionBtn}
          onPress={() => handleOpenPayment(null, 'Holding Deposit', 5000)}
        >
          <Ionicons name="card-outline" size={16} color={COLORS.primary} />
          <Text style={styles.depositActionText}>Deposit</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'bookings' && styles.tabBtnActive]}
            onPress={() => setActiveTab('bookings')}
          >
            <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>
              Bookings ({bookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'wishlist' && styles.tabBtnActive]}
            onPress={() => setActiveTab('wishlist')}
          >
            <Text style={[styles.tabText, activeTab === 'wishlist' && styles.tabTextActive]}>
              Wishlist ({savedProperties.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'payments' && styles.tabBtnActive]}
            onPress={() => setActiveTab('payments')}
          >
            <Text style={[styles.tabText, activeTab === 'payments' && styles.tabTextActive]}>
              Payments ({transactions.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Tab Content */}
      <ScrollView
        contentContainerStyle={styles.scrollBody}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <>

            {/* TAB: BOOKINGS */}
            {activeTab === 'bookings' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Inspection Appointments</Text>
                  <Text style={styles.sectionCounter}>Total: {bookings.length}</Text>
                </View>

                {bookings.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="calendar-outline" size={42} color={COLORS.textMuted} />
                    <Text style={styles.emptyTitle}>No Inspections Scheduled</Text>
                    <Text style={styles.emptySubtitle}>
                      When you book an inspection on any property listing, your schedule will appear here.
                    </Text>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => router.push('/(tabs)/explore' as any)}
                    >
                      <Text style={styles.actionBtnText}>Find Properties to Inspect</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  bookings.map((b) => (
                    <View key={b._id} style={styles.itemCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemTitle}>{b.propertyId?.title || 'Property Inspection'}</Text>
                          <Text style={styles.itemAmount}>
                            {b.date} at {b.timeSlot} ({b.type})
                          </Text>
                          {b.propertyId?.address && (
                            <Text style={styles.itemAddress}>
                              📍 {b.propertyId.address.street}, {b.propertyId.address.suburb}
                            </Text>
                          )}
                        </View>
                        <View style={[styles.statusPill, styles.statusAccepted]}>
                          <Text style={[styles.statusPillText, styles.statusAcceptedText]}>
                            {b.status || 'Confirmed'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* TAB: WISHLIST */}
            {activeTab === 'wishlist' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Saved Properties</Text>
                  <Text style={styles.sectionCounter}>Saved: {savedProperties.length}</Text>
                </View>

                {savedProperties.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="heart-outline" size={42} color={COLORS.textMuted} />
                    <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
                    <Text style={styles.emptySubtitle}>
                      Save your favorite luxury estates to track prices and schedule inspections.
                    </Text>
                  </View>
                ) : (
                  savedProperties.map((p) => (
                    <TouchableOpacity
                      key={p._id}
                      style={styles.itemCard}
                      onPress={() => router.push(`/property/${p._id}` as any)}
                    >
                      <View style={styles.itemHeader}>
                        {p.images?.[0] && (
                          <Image source={{ uri: p.images[0] }} style={styles.itemImage} />
                        )}
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.itemTitle} numberOfLines={1}>{p.title}</Text>
                          <Text style={styles.itemAmount}>${p.price?.toLocaleString()}</Text>
                          <Text style={styles.itemAddress} numberOfLines={1}>
                            📍 {p.address?.suburb}, {p.address?.state}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* TAB: PAYMENTS */}
            {activeTab === 'payments' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Payment & Deposit History</Text>
                  <Text style={styles.sectionCounter}>Total: {transactions.length}</Text>
                </View>

                {transactions.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="card-outline" size={42} color={COLORS.textMuted} />
                    <Text style={styles.emptyTitle}>No Transactions Recorded</Text>
                    <Text style={styles.emptySubtitle}>
                      Holding deposits and premium listing packages you purchase will be logged here.
                    </Text>
                  </View>
                ) : (
                  transactions.map((tx) => (
                    <View key={tx._id} style={styles.itemCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                          <Text style={styles.itemTitle}>{tx.package || 'Deposit Payment'}</Text>
                          <Text style={styles.itemSubtext}>
                            Tx ID: {tx._id?.substring(0, 10)}... • {new Date(tx.createdAt || Date.now()).toLocaleDateString()}
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
  depositActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
    gap: 4,
  },
  depositActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
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
    gap: 10,
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
  payDepositBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  payDepositBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
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

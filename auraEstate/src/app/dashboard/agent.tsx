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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
  fetchProperties,
  deleteProperty,
  updatePropertyStatus,
  fetchExpertRequests,
  markExpertRequestAsRead,
  fetchOffers,
  fetchBookings,
} from '@/services/api';
import { COLORS } from '@/constants/colors';
import InboxPanel from '@/components/InboxPanel';
import AddPropertyModal from '@/components/AddPropertyModal';
import EditProfileModal from '@/components/EditProfileModal';
import AccessRestrictedView from '@/components/AccessRestrictedView';

export default function AgentDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const isAuthorized = !!user && (user.role === 'agent' || user.role === 'agency' || user.role === 'admin' || user.role === 'super_admin');

  const [properties, setProperties] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'inquiries' | 'bookings' | 'messages'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const loadData = async () => {
    try {
      const [pRes, inqRes, oRes, bRes] = await Promise.all([
        fetchProperties({ agentId: user?._id }).catch(() => ({ data: { success: false, properties: [] } })),
        fetchExpertRequests().catch(() => ({ data: { success: false, inquiries: [] } })),
        fetchOffers().catch(() => ({ data: { success: false, offers: [] } })),
        fetchBookings().catch(() => ({ data: { success: false, bookings: [] } })),
      ]);

      if (pRes.data?.success) setProperties(pRes.data.properties || []);
      if (inqRes.data?.success) setInquiries(inqRes.data.inquiries || inqRes.data.requests || []);
      if (oRes.data?.success) setOffers(oRes.data.offers || []);
      if (bRes.data?.success) setBookings(bRes.data.bookings || []);
    } catch (err) {
      console.error('Error loading agent dashboard data:', err);
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
        portalTitle="Agent CRM & Performance"
        requiredRoleLabel="Licensed Agent"
        currentUserRole={user?.role}
      />
    );
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await markExpertRequestAsRead(id);
      setInquiries(prev => prev.map(inq => inq._id === id ? { ...inq, status: 'Read' } : inq));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProperty = (id: string) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to permanently remove this property?',
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
          <Text style={styles.badgeText}>LICENSED AGENT CRM</Text>
          <Text style={styles.headerTitle}>{user?.name || 'Agent Workspace'}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => setIsEditProfileOpen(true)}
        >
          <Ionicons name="person-outline" size={16} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addPropertyBtn}
          onPress={() => setIsAddModalOpen(true)}
        >
          <Ionicons name="add" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'properties' && styles.tabBtnActive]}
            onPress={() => setActiveTab('properties')}
          >
            <Text style={[styles.tabText, activeTab === 'properties' && styles.tabTextActive]}>
              Listings ({properties.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'inquiries' && styles.tabBtnActive]}
            onPress={() => setActiveTab('inquiries')}
          >
            <Text style={[styles.tabText, activeTab === 'inquiries' && styles.tabTextActive]}>
              Leads ({inquiries.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'bookings' && styles.tabBtnActive]}
            onPress={() => setActiveTab('bookings')}
          >
            <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>
              Appts ({bookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'messages' && styles.tabBtnActive]}
            onPress={() => setActiveTab('messages')}
          >
            <Text style={[styles.tabText, activeTab === 'messages' && styles.tabTextActive]}>
              Live Chat
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
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <View style={styles.tabSection}>
                {/* KPI Grid */}
                <View style={styles.kpiGrid}>
                  <View style={styles.kpiCard}>
                    <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(14, 165, 233, 0.15)' }]}>
                      <Ionicons name="business" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.kpiLabel}>Active Listings</Text>
                    <Text style={styles.kpiValue}>{properties.length}</Text>
                  </View>

                  <View style={styles.kpiCard}>
                    <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                      <Ionicons name="people" size={20} color={COLORS.success} />
                    </View>
                    <Text style={styles.kpiLabel}>Client Inquiries</Text>
                    <Text style={styles.kpiValue}>{inquiries.length}</Text>
                  </View>

                  <View style={styles.kpiCard}>
                    <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
                      <Ionicons name="calendar" size={20} color="#eab308" />
                    </View>
                    <Text style={styles.kpiLabel}>Inspections</Text>
                    <Text style={styles.kpiValue}>{bookings.length}</Text>
                  </View>

                  <View style={styles.kpiCard}>
                    <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                      <Ionicons name="pricetag" size={20} color="#a855f7" />
                    </View>
                    <Text style={styles.kpiLabel}>Active Offers</Text>
                    <Text style={styles.kpiValue}>{offers.length}</Text>
                  </View>
                </View>

                {/* Quick Action Banner */}
                <View style={styles.quickActionBanner}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bannerTitle}>Grow Your Exclusive Portfolio</Text>
                    <Text style={styles.bannerSubtitle}>
                      Use AI description generators and publish directly to prime buyers.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.bannerBtn}
                    onPress={() => setIsAddModalOpen(true)}
                  >
                    <Text style={styles.bannerBtnText}>+ New Listing</Text>
                  </TouchableOpacity>
                </View>

                {/* Recent Inquiries List Preview */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Inquiries</Text>
                  <TouchableOpacity onPress={() => setActiveTab('inquiries')}>
                    <Text style={styles.viewAllText}>View All ({inquiries.length})</Text>
                  </TouchableOpacity>
                </View>

                {inquiries.slice(0, 3).map((inq) => (
                  <View key={inq._id} style={styles.itemCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.itemTitle}>{inq.userName || inq.name || 'Client Lead'}</Text>
                      <Text style={styles.itemSubtext}>{inq.phone || inq.userEmail || inq.email}</Text>
                    </View>
                    <Text style={styles.inquiryMessage} numberOfLines={2}>{inq.message}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* TAB: PROPERTIES */}
            {activeTab === 'properties' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Managed Property Listings</Text>
                  <TouchableOpacity
                    style={styles.smallAddBtn}
                    onPress={() => setIsAddModalOpen(true)}
                  >
                    <Ionicons name="add" size={14} color="#ffffff" />
                    <Text style={styles.smallAddBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {properties.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="home-outline" size={42} color={COLORS.textMuted} />
                    <Text style={styles.emptyTitle}>No Assigned Listings</Text>
                    <Text style={styles.emptySubtitle}>
                      Create exclusive property listings to market across the Aura platform.
                    </Text>
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
                            {prop.bedrooms} Beds • {prop.bathrooms} Baths • {prop.type}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.itemFooter}>
                        <TouchableOpacity
                          style={styles.viewDetailsBtn}
                          onPress={() => router.push(`/property/${prop._id}` as any)}
                        >
                          <Ionicons name="eye-outline" size={14} color={COLORS.textPrimary} />
                          <Text style={styles.viewDetailsText}>View Public Page</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleDeleteProperty(prop._id)}
                        >
                          <Ionicons name="trash-outline" size={14} color={COLORS.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* TAB: INQUIRIES */}
            {activeTab === 'inquiries' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Buyer Property Inquiries</Text>
                  <Text style={styles.sectionCounter}>Total: {inquiries.length}</Text>
                </View>

                {inquiries.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="mail-outline" size={42} color={COLORS.textMuted} />
                    <Text style={styles.emptyTitle}>No Inquiries Received</Text>
                    <Text style={styles.emptySubtitle}>
                      When prospective buyers submit property enquiries with their phone number and email, they will appear here.
                    </Text>
                  </View>
                ) : (
                  inquiries.map((inq) => {
                    const buyerName = inq.buyerName || inq.userName || inq.name || 'Buyer Lead';
                    const buyerPhone = inq.buyerPhone || inq.phone || inq.buyerId?.phone;
                    const buyerEmail = inq.buyerEmail || inq.userEmail || inq.email || inq.buyerId?.email;
                    const propTitle = inq.propertyTitle || inq.propertyId?.title;
                    const message = inq.buyerMessage || inq.message || 'Interested in this property.';
                    const isRead = inq.status === 'Read' || inq.status === 'contacted' || inq.isRead;

                    return (
                      <View key={inq._id} style={styles.itemCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.itemTitle}>{buyerName}</Text>
                            {propTitle && (
                              <Text style={[styles.itemSubtext, { color: COLORS.primary, fontWeight: '700', marginTop: 2 }]}>
                                🏡 {propTitle}
                              </Text>
                            )}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                              <Ionicons name="call" size={13} color={COLORS.primary} />
                              <Text style={styles.itemAmount}>{buyerPhone || 'No phone provided'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                              <Ionicons name="mail" size={13} color={COLORS.textMuted} />
                              <Text style={styles.itemSubtext}>{buyerEmail || 'No email provided'}</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={[styles.statusPill, isRead ? styles.statusRead : styles.statusUnread]}
                            onPress={() => handleMarkAsRead(inq._id)}
                          >
                            <Text style={[styles.statusPillText, isRead ? styles.statusReadText : styles.statusUnreadText]}>
                              {isRead ? 'Contacted' : 'New Lead'}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <Text style={styles.inquiryMessage}>{message}</Text>

                        {/* Direct Contact Actions */}
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                          {buyerPhone && (
                            <TouchableOpacity
                              style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                backgroundColor: '#f0fdf4',
                                borderWidth: 1,
                                borderColor: '#86efac',
                                paddingVertical: 8,
                                borderRadius: 10,
                              }}
                              onPress={() => Linking.openURL(`tel:${buyerPhone}`)}
                            >
                              <Ionicons name="call" size={14} color="#15803d" />
                              <Text style={{ fontSize: 12, fontWeight: '700', color: '#15803d' }}>Call Buyer</Text>
                            </TouchableOpacity>
                          )}
                          {buyerEmail && (
                            <TouchableOpacity
                              style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                backgroundColor: '#f0f9ff',
                                borderWidth: 1,
                                borderColor: COLORS.primary,
                                paddingVertical: 8,
                                borderRadius: 10,
                              }}
                              onPress={() => Linking.openURL(`mailto:${buyerEmail}?subject=Regarding your enquiry for ${propTitle || 'Property'}`)}
                            >
                              <Ionicons name="mail" size={14} color={COLORS.primaryDark} />
                              <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primaryDark }}>Email Buyer</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* TAB: BOOKINGS */}
            {activeTab === 'bookings' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Scheduled Inspection Visits</Text>
                  <Text style={styles.sectionCounter}>Total: {bookings.length}</Text>
                </View>

                {bookings.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="calendar-outline" size={42} color={COLORS.textMuted} />
                    <Text style={styles.emptyTitle}>No Appointments</Text>
                    <Text style={styles.emptySubtitle}>Confirmed client site inspections will be listed here.</Text>
                  </View>
                ) : (
                  bookings.map((b) => (
                    <View key={b._id} style={styles.itemCard}>
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
                  ))
                )}
              </View>
            )}

            {/* TAB: MESSAGES */}
            {activeTab === 'messages' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Real-time Agent Chat</Text>
                </View>
                <InboxPanel />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPropertyAdded={(p) => {
          setProperties(prev => [p, ...prev]);
          Alert.alert('Success', 'Listing successfully added to your portfolio!');
        }}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
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
    gap: 8,
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
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  addPropertyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: 14,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  kpiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  quickActionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.25)',
    gap: 10,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bannerBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bannerBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionCounter: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  itemCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    gap: 8,
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
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
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
  inquiryMessage: {
    fontSize: 12,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.bgDark,
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
    lineHeight: 18,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: 10,
    marginTop: 4,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.borderDark,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 2,
  },
  smallAddBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusUnread: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  statusUnreadText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  statusRead: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  statusReadText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
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
  },
});

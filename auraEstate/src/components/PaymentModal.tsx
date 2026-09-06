import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { checkoutStripePackage } from '../services/api';

interface PaymentModalProps {
  visible?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  defaultPackage?: string;
  packageType?: string;
  defaultAmount?: number;
  amount?: number;
  propertyId?: string | null;
  onPaymentSuccess?: (transaction: any) => void;
  onSuccess?: (transaction: any) => void;
}

const BUYER_PACKAGES = [
  { title: 'Holding Deposit', price: 5000, desc: 'Reserve property exclusively for 14 days' },
];

const SELLER_AGENT_PACKAGES = [
  { title: 'Featured Listing', price: 99, desc: '30 Days Spotlight on homepage and explore tab' },
  { title: 'Premium Listing', price: 249, desc: 'Top Feed placement + Gold Certified Agency Badge' },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  isOpen,
  onClose,
  defaultPackage,
  packageType,
  defaultAmount,
  amount,
  propertyId = null,
  onPaymentSuccess,
  onSuccess,
}) => {
  const isModalVisible = visible ?? isOpen ?? false;
  const initialPackage = packageType || defaultPackage || 'Holding Deposit';
  const initialAmount = amount ?? defaultAmount ?? 5000;
  const handleSuccessCallback = onSuccess || onPaymentSuccess;
  const { user } = useAuth();
  const isBuyer =
    user?.role === 'buyer' ||
    (defaultPackage === 'Holding Deposit' &&
      user?.role !== 'seller' &&
      user?.role !== 'agent' &&
      user?.role !== 'agency');

  const packages = isBuyer ? BUYER_PACKAGES : SELLER_AGENT_PACKAGES;

  const [selectedPkg, setSelectedPkg] = useState<string>(initialPackage);
  const [selectedAmt, setSelectedAmt] = useState<number>(initialAmount);
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Online NetBanking / UPI'>('Credit Card');

  // Card fields
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState<string>('12/28');
  const [cvc, setCvc] = useState<string>('888');

  // UPI fields
  const [upiRefId, setUpiRefId] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    if (isModalVisible) {
      const match = packages.find((p) => p.title === initialPackage);
      if (match) {
        setSelectedPkg(match.title);
        setSelectedAmt(match.price);
      } else {
        setSelectedPkg(packages[0].title);
        setSelectedAmt(packages[0].price);
      }
      setError('');
      setSuccessData(null);
    }
  }, [isModalVisible, initialPackage, initialAmount, user?.role]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await checkoutStripePackage({
        propertyId,
        packageType: selectedPkg,
        amount: Number(selectedAmt),
        paymentMethod,
        transactionNotes:
          paymentMethod === 'Online NetBanking / UPI'
            ? `UPI Ref: ${upiRefId || 'QR Scan'}`
            : 'Stripe Mobile Secure Checkout',
      });

      if (res.data && res.data.success) {
        setSuccessData(res.data.transaction);
        setTimeout(() => {
          if (handleSuccessCallback) handleSuccessCallback(res.data.transaction);
          onClose();
        }, 2000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment processing error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isModalVisible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Secure Payment Portal</Text>
              <Text style={styles.headerSubtitle}>256-Bit Encrypted Escrow & Stripe Gateway</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Ionicons name="close" size={22} color={AuraColors.text} />
            </Pressable>
          </View>

          {successData ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="shield-checkmark" size={48} color={AuraColors.emerald} />
              </View>
              <Text style={styles.successTitle}>Payment Verified & Received!</Text>
              <Text style={styles.successAmount}>${selectedAmt.toLocaleString()} AUD</Text>
              <Text style={styles.successSubtitle}>
                Transaction ID: {successData._id || 'TXN-948291'}
              </Text>
              <Text style={styles.receiptNote}>
                An official receipt and transaction confirmation has been recorded in your account ledger.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={AuraColors.rose} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Package Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>SELECT PACKAGE</Text>
                {packages.map((pkg) => {
                  const isSelected = selectedPkg === pkg.title;
                  return (
                    <Pressable
                      key={pkg.title}
                      style={[styles.pkgCard, isSelected && styles.pkgCardActive]}
                      onPress={() => {
                        setSelectedPkg(pkg.title);
                        setSelectedAmt(pkg.price);
                      }}
                    >
                      <View style={styles.pkgHeader}>
                        <Text style={[styles.pkgTitle, isSelected && styles.pkgTitleActive]}>
                          {pkg.title}
                        </Text>
                        <Text style={[styles.pkgPrice, isSelected && styles.pkgPriceActive]}>
                          ${pkg.price.toLocaleString()} AUD
                        </Text>
                      </View>
                      <Text style={styles.pkgDesc}>{pkg.desc}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Payment Method Switcher */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
                <View style={styles.methodRow}>
                  <Pressable
                    style={[
                      styles.methodBtn,
                      paymentMethod === 'Credit Card' && styles.methodBtnActive,
                    ]}
                    onPress={() => setPaymentMethod('Credit Card')}
                  >
                    <Ionicons
                      name="card-outline"
                      size={18}
                      color={paymentMethod === 'Credit Card' ? '#ffffff' : AuraColors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.methodText,
                        paymentMethod === 'Credit Card' && styles.methodTextActive,
                      ]}
                    >
                      Credit Card
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.methodBtn,
                      paymentMethod === 'Online NetBanking / UPI' && styles.methodBtnActive,
                    ]}
                    onPress={() => setPaymentMethod('Online NetBanking / UPI')}
                  >
                    <Ionicons
                      name="qr-code-outline"
                      size={18}
                      color={
                        paymentMethod === 'Online NetBanking / UPI'
                          ? '#ffffff'
                          : AuraColors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.methodText,
                        paymentMethod === 'Online NetBanking / UPI' && styles.methodTextActive,
                      ]}
                    >
                      NetBanking / UPI
                    </Text>
                  </Pressable>
                </View>
              </View>

              {paymentMethod === 'Credit Card' ? (
                /* Card Input Mock */
                <View style={styles.cardBox}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>CARD NUMBER</Text>
                    <TextInput
                      style={styles.textInput}
                      value={cardNumber}
                      onChangeText={setCardNumber}
                      placeholder="4242 •••• •••• 4242"
                      placeholderTextColor={AuraColors.textLight}
                    />
                  </View>
                  <View style={styles.cardRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>EXPIRY</Text>
                      <TextInput
                        style={styles.textInput}
                        value={expiry}
                        onChangeText={setExpiry}
                        placeholder="MM/YY"
                        placeholderTextColor={AuraColors.textLight}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>CVC / CVV</Text>
                      <TextInput
                        style={styles.textInput}
                        value={cvc}
                        onChangeText={setCvc}
                        placeholder="CVC"
                        keyboardType="numeric"
                        placeholderTextColor={AuraColors.textLight}
                      />
                    </View>
                  </View>
                </View>
              ) : (
                /* UPI / NetBanking Input */
                <View style={styles.upiBox}>
                  <Text style={styles.upiInstructions}>
                    Scan or transfer to escrow ID: <Text style={styles.upiId}>auraestates@icici</Text>
                  </Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>UPI TRANSACTION / REFERENCE ID</Text>
                    <TextInput
                      style={styles.textInput}
                      value={upiRefId}
                      onChangeText={setUpiRefId}
                      placeholder="e.g. UPI-9284729103"
                      placeholderTextColor={AuraColors.textLight}
                    />
                  </View>
                </View>
              )}

              {/* Pay Now Button */}
              <Pressable
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>Pay ${selectedAmt.toLocaleString()} AUD Now</Text>
                )}
              </Pressable>
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AuraColors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: AuraColors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  formContainer: {
    padding: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AuraColors.roseLight,
    borderWidth: 1,
    borderColor: AuraColors.roseBorder,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: AuraColors.rose,
    fontWeight: '600',
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: AuraColors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  pkgCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 8,
  },
  pkgCardActive: {
    backgroundColor: AuraColors.primaryLight,
    borderColor: AuraColors.primary,
  },
  pkgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pkgTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: AuraColors.text,
  },
  pkgTitleActive: {
    color: AuraColors.primaryDark,
  },
  pkgPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: AuraColors.primaryDark,
  },
  pkgPriceActive: {
    color: AuraColors.primaryDark,
  },
  pkgDesc: {
    fontSize: 12,
    color: AuraColors.textMuted,
    lineHeight: 16,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 10,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  methodBtnActive: {
    backgroundColor: AuraColors.primary,
    borderColor: AuraColors.primary,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.textSecondary,
  },
  methodTextActive: {
    color: '#ffffff',
  },
  cardBox: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  upiBox: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  upiInstructions: {
    fontSize: 12,
    color: AuraColors.textSecondary,
    marginBottom: 10,
  },
  upiId: {
    fontWeight: '800',
    color: AuraColors.primaryDark,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: AuraColors.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: AuraColors.text,
    fontWeight: '600',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
  },
  submitBtn: {
    backgroundColor: AuraColors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: AuraColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
    marginTop: 6,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  successContainer: {
    padding: 30,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AuraColors.emeraldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AuraColors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  successAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: AuraColors.primaryDark,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.textSecondary,
    marginBottom: 8,
  },
  receiptNote: {
    fontSize: 12,
    color: AuraColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PaymentModal;

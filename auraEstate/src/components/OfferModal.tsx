import React, { useState } from 'react';
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
import { createOffer } from '../services/api';

interface OfferModalProps {
  visible: boolean;
  onClose: () => void;
  property: {
    _id: string;
    title: string;
    price?: number;
  } | null;
  onSuccess?: () => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  visible,
  onClose,
  property,
  onSuccess,
}) => {
  const [offerAmount, setOfferAmount] = useState<string>(
    property?.price ? String(property.price) : '1500000'
  );
  const [depositAmount, setDepositAmount] = useState<string>('20000');
  const [conditions, setConditions] = useState<string>(
    'Subject to finance approval & pest inspection within 14 days'
  );
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  if (!property) return null;

  const handleSubmit = async () => {
    if (!acceptedTerms) {
      setError('Please agree to terms and authorization.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await createOffer({
        propertyId: property._id,
        offerAmount: Number(offerAmount),
        depositAmount: Number(depositAmount),
        conditions,
      });

      if (res.data && res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        throw new Error('Offer submission failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit offer. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Make a Formal Offer</Text>
              <Text style={styles.propertyTitle} numberOfLines={1}>
                {property.title}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Ionicons name="close" size={22} color={AuraColors.text} />
            </Pressable>
          </View>

          {success ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={48} color={AuraColors.emerald} />
              </View>
              <Text style={styles.successTitle}>Purchase Offer Transmitted!</Text>
              <Text style={styles.successSubtitle}>
                Your formal digital offer of ${Number(offerAmount).toLocaleString()} has been securely
                delivered to the listing agent and owner.
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

              {/* Offer Amount Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>OFFER AMOUNT (AUD)</Text>
                <View style={styles.inputWithIcon}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={offerAmount}
                    onChangeText={setOfferAmount}
                    placeholder="e.g. 1850000"
                    placeholderTextColor={AuraColors.textLight}
                  />
                </View>
                <Text style={styles.guideText}>
                  Guide Price: ${property.price ? property.price.toLocaleString() : 'POA'}
                </Text>
              </View>

              {/* Deposit Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>INITIAL DEPOSIT (AUD)</Text>
                <View style={styles.inputWithIcon}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={depositAmount}
                    onChangeText={setDepositAmount}
                    placeholder="e.g. 20000"
                    placeholderTextColor={AuraColors.textLight}
                  />
                </View>
              </View>

              {/* Contract Conditions */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CONTRACT CONDITIONS & TIMELINES</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  value={conditions}
                  onChangeText={setConditions}
                  placeholder="e.g. Subject to finance approval within 14 days..."
                  placeholderTextColor={AuraColors.textLight}
                />
              </View>

              {/* Terms Checkbox */}
              <Pressable
                style={styles.termsRow}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <Ionicons
                  name={acceptedTerms ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={acceptedTerms ? AuraColors.primary : AuraColors.textLight}
                />
                <Text style={styles.termsText}>
                  I confirm this offer is accurate and authorize AuraEstates to submit this binding
                  proposal to the seller.
                </Text>
              </Pressable>

              {/* Submit CTA */}
              <Pressable
                style={[styles.submitBtn, (!acceptedTerms || loading) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!acceptedTerms || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Formal Offer</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
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
  propertyTitle: {
    fontSize: 12,
    color: AuraColors.textMuted,
    marginTop: 2,
    maxWidth: 260,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: AuraColors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: AuraColors.primaryDark,
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    color: AuraColors.text,
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 13,
    fontWeight: '500',
  },
  guideText: {
    fontSize: 11,
    color: AuraColors.textMuted,
    marginTop: 4,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    color: AuraColors.textSecondary,
    lineHeight: 18,
    flex: 1,
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
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    color: AuraColors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OfferModal;

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
import { createBooking } from '../services/api';

interface InspectionBookingModalProps {
  visible: boolean;
  onClose: () => void;
  property: {
    _id: string;
    title: string;
  } | null;
  onSuccess?: () => void;
}

const TIME_SLOTS = [
  '10:00 AM - 10:30 AM',
  '11:00 AM - 11:30 AM',
  '02:00 PM - 02:30 PM',
  '04:00 PM - 04:30 PM',
];

export const InspectionBookingModal: React.FC<InspectionBookingModalProps> = ({
  visible,
  onClose,
  property,
  onSuccess,
}) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(getTodayString());
  const [timeSlot, setTimeSlot] = useState<string>('11:00 AM - 11:30 AM');
  const [inspectionType, setInspectionType] = useState<'In-Person' | 'Video Tour'>('In-Person');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  if (!property) return null;

  const handleBooking = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await createBooking({
        propertyId: property._id,
        date: date || getTodayString(),
        timeSlot,
        type: inspectionType,
        notes,
      });

      if (res.data && res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        throw new Error('Booking failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule appointment. Please try again.');
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
              <Text style={styles.headerTitle}>Schedule Inspection</Text>
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
              <Text style={styles.successTitle}>Inspection Confirmed!</Text>
              <Text style={styles.successSubtitle}>
                Your appointment for {property.title} has been confirmed for {date} during the {timeSlot} window.
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

              {/* Format selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>INSPECTION FORMAT</Text>
                <View style={styles.formatRow}>
                  {(['In-Person', 'Video Tour'] as const).map((fmt) => {
                    const isSelected = inspectionType === fmt;
                    return (
                      <Pressable
                        key={fmt}
                        style={[styles.formatBtn, isSelected && styles.formatBtnActive]}
                        onPress={() => setInspectionType(fmt)}
                      >
                        <Ionicons
                          name={fmt === 'In-Person' ? 'walk-outline' : 'videocam-outline'}
                          size={18}
                          color={isSelected ? '#ffffff' : AuraColors.textSecondary}
                        />
                        <Text style={[styles.formatBtnText, isSelected && styles.formatBtnTextActive]}>
                          {fmt}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Preferred Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PREFERRED DATE (YYYY-MM-DD)</Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="calendar-outline" size={18} color={AuraColors.primary} />
                  <TextInput
                    style={styles.textInput}
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={AuraColors.textLight}
                  />
                </View>
              </View>

              {/* Time Slots */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SELECT TIME SLOT</Text>
                {TIME_SLOTS.map((slot) => {
                  const isSelected = timeSlot === slot;
                  return (
                    <Pressable
                      key={slot}
                      style={[styles.slotCard, isSelected && styles.slotCardActive]}
                      onPress={() => setTimeSlot(slot)}
                    >
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={isSelected ? AuraColors.primaryDark : AuraColors.textLight}
                      />
                      <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>
                        {slot}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color={AuraColors.primaryDark} style={{ marginLeft: 'auto' }} />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SPECIAL QUESTIONS / NOTES (OPTIONAL)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="e.g. Inquiring about storage space or floor plans..."
                  placeholderTextColor={AuraColors.textLight}
                />
              </View>

              {/* Confirm CTA */}
              <Pressable
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleBooking}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>Confirm Private Appointment</Text>
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
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  formatRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formatBtn: {
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
  formatBtnActive: {
    backgroundColor: AuraColors.primary,
    borderColor: AuraColors.primary,
  },
  formatBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: AuraColors.textSecondary,
  },
  formatBtnTextActive: {
    color: '#ffffff',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: AuraColors.text,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 6,
  },
  slotCardActive: {
    backgroundColor: AuraColors.primaryLight,
    borderColor: AuraColors.primary,
  },
  slotText: {
    fontSize: 13,
    fontWeight: '600',
    color: AuraColors.textSecondary,
  },
  slotTextActive: {
    color: AuraColors.primaryDark,
    fontWeight: '800',
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    padding: 12,
    height: 70,
    textAlignVertical: 'top',
    fontSize: 13,
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
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    color: AuraColors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default InspectionBookingModal;

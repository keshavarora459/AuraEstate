import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { sendPropertyEnquiry } from '../services/api';
import {
  getPropertyId,
  getPropertyTitle,
  getPropertyPrice,
  getPropertyAddress,
  getPropertyImages,
} from '../utils/propertyHelper';

interface EnquiryModalProps {
  visible: boolean;
  onClose: () => void;
  property: any;
  agent: any;
}

const QUICK_INQUIRY_TAGS = [
  'Request Price Guide',
  'Arrange Private Inspection',
  'Request Contract of Sale',
  'Ask About Rental Yield',
];

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  visible,
  onClose,
  property,
  agent,
}) => {
  const { user } = useAuth();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const title = getPropertyTitle(property);
  const price = getPropertyPrice(property);
  const address = getPropertyAddress(property);
  const images = getPropertyImages(property);
  const heroImage = images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600';

  useEffect(() => {
    if (visible && user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setMessage(
        `Hi ${agent?.name || 'Agent'}, I am interested in ${title} (${price}) and would like to receive more details or schedule a private viewing.`
      );
    }
  }, [visible, user, property, agent]);

  const handleTagPress = (tag: string) => {
    setMessage(`Hi ${agent?.name || 'Agent'}, I am interested in ${title}. Could you please assist me with: ${tag}?`);
  };

  const handleSubmit = async () => {
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedPhone) {
      Alert.alert('Phone Number Required', 'Please enter your phone number so the agent can contact you.');
      return;
    }

    if (!trimmedEmail) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const propertyId = getPropertyId(property);
      const res = await sendPropertyEnquiry({
        propertyId,
        agentId: agent?._id || agent?.id,
        name: trimmedName || user?.name || 'Interested Buyer',
        email: trimmedEmail,
        phone: trimmedPhone,
        message: message.trim(),
      });

      if (res.data?.success) {
        Alert.alert(
          'Enquiry Sent Successfully!',
          `Agent ${agent?.name || 'assigned'} has received your enquiry, phone number (${trimmedPhone}), and email. They will get in touch with you shortly.`,
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        Alert.alert('Submission Error', res.data?.message || 'Could not send enquiry. Please try again.');
      }
    } catch (err: any) {
      console.error('Enquiry submission error:', err);
      Alert.alert(
        'Submission Error',
        err.response?.data?.message || 'Failed to submit enquiry to agent. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Enquire With Agent</Text>
              <Text style={styles.modalSubtitle}>Send your details directly to the listing agent</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={AuraColors.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Property Card Snapshot */}
            <View style={styles.propertySnapshot}>
              <Image source={{ uri: heroImage }} style={styles.propertyThumbnail} />
              <View style={styles.propertyMeta}>
                <Text style={styles.snapshotTitle} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.snapshotPrice}>{price}</Text>
                <Text style={styles.snapshotAddress} numberOfLines={1}>
                  {address}
                </Text>
              </View>
            </View>

            {/* Target Agent Badge */}
            <View style={styles.agentCardRow}>
              <Image
                source={{
                  uri:
                    agent?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(agent?.name || 'Agent')}&background=random`,
                }}
                style={styles.agentAvatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.agentNameLabel}>{agent?.name || 'Licensed Agent'}</Text>
                <Text style={styles.agentAgencyLabel}>{agent?.agency || 'Prestige Real Estate'}</Text>
              </View>
              <View style={styles.agentVerifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={AuraColors.emerald} />
                <Text style={styles.agentVerifiedText}>Verified</Text>
              </View>
            </View>

            {/* Quick Inquiry Options */}
            <Text style={styles.fieldSectionLabel}>Quick Inquiry Topics</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
              {QUICK_INQUIRY_TAGS.map((tag) => (
                <Pressable key={tag} style={styles.tagPill} onPress={() => handleTagPress(tag)}>
                  <Ionicons name="chatbubble-ellipses-outline" size={12} color={AuraColors.primary} />
                  <Text style={styles.tagPillText}>{tag}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Buyer Contact Form */}
            <Text style={styles.fieldSectionLabel}>Your Contact Details (Sent to Agent)</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.inputField}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={AuraColors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.inputField}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="your.email@example.com"
                placeholderTextColor={AuraColors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number * (Required for Callback)</Text>
              <TextInput
                style={[styles.inputField, !phone && styles.inputFieldHighlight]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+61 400 000 000"
                placeholderTextColor={AuraColors.textLight}
              />
              <Text style={styles.inputHelperText}>
                The agent will use this phone number to discuss inspections and pricing with you.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Message</Text>
              <TextInput
                style={[styles.inputField, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Write your enquiry message here..."
                placeholderTextColor={AuraColors.textLight}
              />
            </View>
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={16} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Submit Enquiry to Agent</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AuraColors.text,
  },
  modalSubtitle: {
    fontSize: 12,
    color: AuraColors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  scrollArea: {
    maxHeight: 520,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  propertySnapshot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  propertyThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  propertyMeta: {
    flex: 1,
  },
  snapshotTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AuraColors.text,
  },
  snapshotPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: AuraColors.primary,
    marginTop: 2,
  },
  snapshotAddress: {
    fontSize: 11,
    color: AuraColors.textMuted,
    marginTop: 2,
  },
  agentCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  agentNameLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: AuraColors.text,
  },
  agentAgencyLabel: {
    fontSize: 11,
    color: AuraColors.textMuted,
  },
  agentVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  agentVerifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: AuraColors.emerald,
  },
  fieldSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  tagsScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AuraColors.primaryLight,
    borderWidth: 1,
    borderColor: '#bae6fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: AuraColors.primaryDark,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.text,
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: AuraColors.text,
  },
  inputFieldHighlight: {
    borderColor: AuraColors.primary,
    backgroundColor: '#f0f9ff',
  },
  inputHelperText: {
    fontSize: 11,
    color: AuraColors.textMuted,
    marginTop: 4,
  },
  textArea: {
    height: 90,
    paddingTop: 10,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AuraColors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: AuraColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
});

export default EnquiryModal;

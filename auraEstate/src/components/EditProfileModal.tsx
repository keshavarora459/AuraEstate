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

interface EditProfileModalProps {
  visible?: boolean;
  isOpen?: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, isOpen, onClose }) => {
  const isModalVisible = visible ?? isOpen ?? false;
  const { user, updateUserProfile } = useAuth();

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (user && isModalVisible) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
      setBio(user.bio || '');
      setError('');
      setSuccess(false);
    }
  }, [user, visible]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      await updateUserProfile({ name, phone, avatar, bio });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.sheetContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <Text style={styles.headerSubtitle}>Update your personal and contact details</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Ionicons name="close" size={22} color={AuraColors.text} />
            </Pressable>
          </View>

          {success ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={48} color={AuraColors.emerald} />
              <Text style={styles.successTitle}>Profile Updated!</Text>
            </View>
          ) : (
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={AuraColors.rose} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your Name"
                  placeholderTextColor={AuraColors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="+61 400 000 000"
                  placeholderTextColor={AuraColors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>AVATAR PHOTO URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={avatar}
                  onChangeText={setAvatar}
                  placeholder="https://images.unsplash.com/..."
                  placeholderTextColor={AuraColors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>BIO / SUMMARY</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell clients or agents about your property goals..."
                  placeholderTextColor={AuraColors.textLight}
                />
              </View>

              <Pressable
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Changes</Text>
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
    maxHeight: '80%',
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
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: AuraColors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: AuraColors.text,
    fontWeight: '600',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: AuraColors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  successContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AuraColors.text,
  },
});

export default EditProfileModal;

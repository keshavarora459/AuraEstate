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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuraColors } from '../constants/colors';
import { createProperty, generateAIDescription } from '../services/api';

interface AddPropertyModalProps {
  visible?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  onPropertyAdded?: (property: any) => void;
}

const PROPERTY_TYPES = ['Residential', 'Villa', 'Apartment', 'Townhouse', 'Commercial', 'Land'];

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  visible,
  isOpen,
  onClose,
  onPropertyAdded,
}) => {
  const isModalVisible = visible ?? isOpen ?? false;
  const [listingType, setListingType] = useState<'Sale' | 'Rent'>('Sale');
  const [propertyType, setPropertyType] = useState<string>('Residential');
  const [title, setTitle] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [pricePeriod, setPricePeriod] = useState<string>('total');
  const [description, setDescription] = useState<string>('');

  // Address
  const [street, setStreet] = useState<string>('');
  const [suburb, setSuburb] = useState<string>('');
  const [city, setCity] = useState<string>('Sydney');
  const [state, setState] = useState<string>('NSW');
  const [postcode, setPostcode] = useState<string>('2000');

  // Specs
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [parkingSpaces, setParkingSpaces] = useState<number>(1);
  const [landArea, setLandArea] = useState<string>('450');
  const [floorArea, setFloorArea] = useState<string>('180');

  // Amenities & Images
  const [amenityInput, setAmenityInput] = useState<string>('');
  const [amenities, setAmenities] = useState<string[]>([
    'Air Conditioning',
    'Swimming Pool',
    'Balcony',
    'Built-in Robes',
  ]);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (idx: number) => {
    setAmenities(amenities.filter((_, i) => i !== idx));
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Url = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setImages((prev) => [...prev, base64Url]);
      }
    } catch (e) {
      console.error('Image picker error', e);
    }
  };

  const handleGenerateAI = async () => {
    if (!title || !suburb) {
      setError('Please enter Title and Suburb before generating AI copy.');
      return;
    }
    setError('');
    setAiGenerating(true);

    try {
      const res = await generateAIDescription({
        title,
        propertyType,
        listingType,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        suburb,
      });
      if (res.data && res.data.success) {
        setDescription(res.data.description);
      }
    } catch (err) {
      setDescription(
        `Exquisite ${propertyType} listing located in the prestigious enclave of ${suburb}. Featuring ${bedrooms} lavish bedrooms, ${bathrooms} bespoke bathrooms, and designer finishes throughout. A rare luxury opportunity.`
      );
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !price || !street || !suburb || !city || !description) {
      setError('Please complete all required fields (Title, Price, Street, Suburb, City, and Description).');
      return;
    }

    setError('');
    setLoading(true);

    const payload = {
      title,
      description,
      propertyType,
      listingType,
      price: Number(price),
      pricePeriod,
      address: {
        street,
        suburb,
        city,
        state,
        postcode,
        country: 'Australia',
      },
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      parkingSpaces: Number(parkingSpaces),
      landArea: Number(landArea) || 450,
      floorArea: Number(floorArea) || 180,
      amenities,
      features: amenities,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'],
      status: 'Published',
    };

    try {
      const res = await createProperty(payload);
      if (res.data && res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          if (onPropertyAdded) onPropertyAdded(res.data.property);
          onClose();
        }, 1500);
      } else {
        throw new Error('Creation failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish property.');
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
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Add Property Listing</Text>
              <Text style={styles.headerSubtitle}>Publish directly to live database</Text>
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
              <Text style={styles.successTitle}>Property Published!</Text>
              <Text style={styles.successSubtitle}>
                Your luxury property is now published in the live catalog.
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

              {/* Listing Intent */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>LISTING TYPE</Text>
                <View style={styles.toggleRow}>
                  {(['Sale', 'Rent'] as const).map((type) => (
                    <Pressable
                      key={type}
                      style={[styles.toggleBtn, listingType === type && styles.toggleBtnActive]}
                      onPress={() => setListingType(type)}
                    >
                      <Text style={[styles.toggleBtnText, listingType === type && styles.toggleBtnTextActive]}>
                        {type === 'Sale' ? 'For Sale' : 'For Rent'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Property Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PROPERTY TYPE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  {PROPERTY_TYPES.map((pt) => (
                    <Pressable
                      key={pt}
                      style={[styles.chip, propertyType === pt && styles.chipActive]}
                      onPress={() => setPropertyType(pt)}
                    >
                      <Text style={[styles.chipText, propertyType === pt && styles.chipTextActive]}>
                        {pt}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PROPERTY TITLE *</Text>
                <TextInput
                  style={styles.textInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Grand Waterfront Villa at Point Piper"
                  placeholderTextColor={AuraColors.textLight}
                />
              </View>

              {/* Price */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PRICE (AUD) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="e.g. 1850000"
                  placeholderTextColor={AuraColors.textLight}
                />
              </View>

              {/* Address Fields */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>STREET ADDRESS *</Text>
                <TextInput
                  style={styles.textInput}
                  value={street}
                  onChangeText={setStreet}
                  placeholder="e.g. 14 Wolseley Road"
                  placeholderTextColor={AuraColors.textLight}
                />
              </View>

              <View style={styles.gridRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>SUBURB *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={suburb}
                    onChangeText={setSuburb}
                    placeholder="Point Piper"
                    placeholderTextColor={AuraColors.textLight}
                  />
                </View>
                <View style={[styles.inputGroup, { width: 90 }]}>
                  <Text style={styles.inputLabel}>STATE</Text>
                  <TextInput
                    style={styles.textInput}
                    value={state}
                    onChangeText={setState}
                    placeholder="NSW"
                    placeholderTextColor={AuraColors.textLight}
                  />
                </View>
              </View>

              {/* Specs Counters */}
              <View style={styles.specsContainer}>
                <View style={styles.counterBox}>
                  <Text style={styles.counterLabel}>Beds</Text>
                  <View style={styles.counterRow}>
                    <Pressable
                      style={styles.counterBtn}
                      onPress={() => setBedrooms((b) => Math.max(1, b - 1))}
                    >
                      <Ionicons name="remove" size={16} color={AuraColors.text} />
                    </Pressable>
                    <Text style={styles.counterVal}>{bedrooms}</Text>
                    <Pressable style={styles.counterBtn} onPress={() => setBedrooms((b) => b + 1)}>
                      <Ionicons name="add" size={16} color={AuraColors.text} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.counterBox}>
                  <Text style={styles.counterLabel}>Baths</Text>
                  <View style={styles.counterRow}>
                    <Pressable
                      style={styles.counterBtn}
                      onPress={() => setBathrooms((b) => Math.max(1, b - 1))}
                    >
                      <Ionicons name="remove" size={16} color={AuraColors.text} />
                    </Pressable>
                    <Text style={styles.counterVal}>{bathrooms}</Text>
                    <Pressable style={styles.counterBtn} onPress={() => setBathrooms((b) => b + 1)}>
                      <Ionicons name="add" size={16} color={AuraColors.text} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.counterBox}>
                  <Text style={styles.counterLabel}>Cars</Text>
                  <View style={styles.counterRow}>
                    <Pressable
                      style={styles.counterBtn}
                      onPress={() => setParkingSpaces((p) => Math.max(0, p - 1))}
                    >
                      <Ionicons name="remove" size={16} color={AuraColors.text} />
                    </Pressable>
                    <Text style={styles.counterVal}>{parkingSpaces}</Text>
                    <Pressable
                      style={styles.counterBtn}
                      onPress={() => setParkingSpaces((p) => p + 1)}
                    >
                      <Ionicons name="add" size={16} color={AuraColors.text} />
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Description + AI Generator */}
              <View style={styles.inputGroup}>
                <View style={styles.descHeader}>
                  <Text style={styles.inputLabel}>DESCRIPTION *</Text>
                  <Pressable
                    style={styles.aiBtn}
                    onPress={handleGenerateAI}
                    disabled={aiGenerating}
                  >
                    {aiGenerating ? (
                      <ActivityIndicator size="small" color={AuraColors.primaryDark} />
                    ) : (
                      <>
                        <Ionicons name="sparkles" size={14} color={AuraColors.primaryDark} />
                        <Text style={styles.aiBtnText}>AI Generator</Text>
                      </>
                    )}
                  </Pressable>
                </View>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe architectural features, views, and lifestyle benefits..."
                  placeholderTextColor={AuraColors.textLight}
                />
              </View>

              {/* Amenities */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>AMENITIES</Text>
                <View style={styles.amenityAddRow}>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    value={amenityInput}
                    onChangeText={setAmenityInput}
                    placeholder="Add feature (e.g. Wine Cellar)"
                    placeholderTextColor={AuraColors.textLight}
                  />
                  <Pressable style={styles.addAmenityBtn} onPress={handleAddAmenity}>
                    <Ionicons name="add" size={20} color="#ffffff" />
                  </Pressable>
                </View>
                <View style={styles.amenitiesWrap}>
                  {amenities.map((a, i) => (
                    <View key={i} style={styles.amenityTag}>
                      <Text style={styles.amenityTagText}>{a}</Text>
                      <Pressable onPress={() => handleRemoveAmenity(i)}>
                        <Ionicons name="close-circle" size={16} color={AuraColors.textMuted} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>

              {/* Images preview & picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PROPERTY PHOTOS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                  {images.map((img, i) => (
                    <View key={i} style={styles.imageThumbContainer}>
                      <Image source={{ uri: img }} style={styles.imageThumb} />
                      <Pressable
                        style={styles.imageDeleteBtn}
                        onPress={() => setImages(images.filter((_, idx) => idx !== i))}
                      >
                        <Ionicons name="close" size={12} color="#ffffff" />
                      </Pressable>
                    </View>
                  ))}
                  <Pressable style={styles.addImageBtn} onPress={handlePickImage}>
                    <Ionicons name="camera-outline" size={24} color={AuraColors.primary} />
                    <Text style={styles.addImageText}>Add Photo</Text>
                  </Pressable>
                </ScrollView>
              </View>

              {/* Publish Button */}
              <Pressable
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>Publish Property Listing</Text>
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
    maxHeight: '90%',
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
    fontSize: 11,
    fontWeight: '800',
    color: AuraColors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: AuraColors.primary,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: AuraColors.textSecondary,
  },
  toggleBtnTextActive: {
    color: '#ffffff',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: AuraColors.primaryLight,
    borderColor: AuraColors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: AuraColors.textSecondary,
  },
  chipTextActive: {
    color: AuraColors.primaryDark,
    fontWeight: '800',
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
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  specsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  counterBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AuraColors.textMuted,
    marginBottom: 6,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterVal: {
    fontSize: 14,
    fontWeight: '800',
    color: AuraColors.text,
  },
  descHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AuraColors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AuraColors.primaryDark,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    fontSize: 12,
    fontWeight: '500',
  },
  amenityAddRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  addAmenityBtn: {
    backgroundColor: AuraColors.primary,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  amenityTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: AuraColors.textSecondary,
  },
  imageScroll: {
    flexDirection: 'row',
  },
  imageThumbContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
    position: 'relative',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
  },
  imageDeleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageBtn: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: AuraColors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AuraColors.primaryLight,
  },
  addImageText: {
    fontSize: 9,
    fontWeight: '700',
    color: AuraColors.primaryDark,
    marginTop: 2,
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
    marginBottom: 24,
    marginTop: 10,
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
  },
});

export default AddPropertyModal;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../constants/colors';

export interface FilterState {
  search: string;
  suburb: string;
  listingType: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  minLandArea: string;
  maxLandArea: string;
  sortBy: string;
}

interface PropertyFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
}

const PROPERTY_TYPES = ['All', 'Villa', 'Apartment', 'Townhouse', 'Residential', 'Commercial', 'Land'];
const BEDROOM_OPTIONS = ['', '1', '2', '3', '4', '5+'];
const BATHROOM_OPTIONS = ['', '1', '2', '3', '4+'];
const PARKING_OPTIONS = ['', '1', '2', '3', '4+'];
const SORT_OPTIONS = [
  { label: 'Newest Listed', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

export const PropertyFiltersModal: React.FC<PropertyFiltersModalProps> = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);

  const update = (key: keyof FilterState, val: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter Properties</Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={AuraColors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Listing Type Toggle */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Listing Intent</Text>
              <View style={styles.segmentContainer}>
                {['', 'Sale', 'Rent'].map((t) => {
                  const isSelected = localFilters.listingType === t;
                  const label = t === '' ? 'All' : t === 'Sale' ? 'To Buy' : 'To Rent';
                  return (
                    <Pressable
                      key={t}
                      style={[styles.segmentBtn, isSelected && styles.segmentBtnActive]}
                      onPress={() => update('listingType', t)}
                    >
                      <Text style={[styles.segmentText, isSelected && styles.segmentTextActive]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Property Type Chips */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Property Type</Text>
              <View style={styles.chipsContainer}>
                {PROPERTY_TYPES.map((pt) => {
                  const val = pt === 'All' ? '' : pt;
                  const isSelected = localFilters.propertyType === val;
                  return (
                    <Pressable
                      key={pt}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => update('propertyType', val)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{pt}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Price Range (AUD)</Text>
              <View style={styles.row}>
                <TextInput
                  style={styles.input}
                  placeholder="Min Price (e.g. 1000000)"
                  placeholderTextColor={AuraColors.textLight}
                  keyboardType="numeric"
                  value={localFilters.minPrice}
                  onChangeText={(t) => update('minPrice', t)}
                />
                <Text style={styles.rangeDivider}>—</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Max Price (e.g. 5000000)"
                  placeholderTextColor={AuraColors.textLight}
                  keyboardType="numeric"
                  value={localFilters.maxPrice}
                  onChangeText={(t) => update('maxPrice', t)}
                />
              </View>
            </View>

            {/* Bedrooms */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Bedrooms</Text>
              <View style={styles.numberRow}>
                {BEDROOM_OPTIONS.map((opt) => {
                  const isSelected = localFilters.bedrooms === opt;
                  return (
                    <Pressable
                      key={opt}
                      style={[styles.numChip, isSelected && styles.numChipActive]}
                      onPress={() => update('bedrooms', opt)}
                    >
                      <Text style={[styles.numChipText, isSelected && styles.numChipTextActive]}>
                        {opt === '' ? 'Any' : opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Bathrooms */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Bathrooms</Text>
              <View style={styles.numberRow}>
                {BATHROOM_OPTIONS.map((opt) => {
                  const isSelected = localFilters.bathrooms === opt;
                  return (
                    <Pressable
                      key={opt}
                      style={[styles.numChip, isSelected && styles.numChipActive]}
                      onPress={() => update('bathrooms', opt)}
                    >
                      <Text style={[styles.numChipText, isSelected && styles.numChipTextActive]}>
                        {opt === '' ? 'Any' : opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Parking Spaces */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Parking Spaces</Text>
              <View style={styles.numberRow}>
                {PARKING_OPTIONS.map((opt) => {
                  const isSelected = localFilters.parking === opt;
                  return (
                    <Pressable
                      key={opt}
                      style={[styles.numChip, isSelected && styles.numChipActive]}
                      onPress={() => update('parking', opt)}
                    >
                      <Text style={[styles.numChipText, isSelected && styles.numChipTextActive]}>
                        {opt === '' ? 'Any' : opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Sort Order */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Sort Order</Text>
              {SORT_OPTIONS.map((so) => {
                const isSelected = (localFilters.sortBy || 'newest') === so.value;
                return (
                  <Pressable
                    key={so.value}
                    style={[styles.sortRow, isSelected && styles.sortRowActive]}
                    onPress={() => update('sortBy', so.value)}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? AuraColors.primary : AuraColors.textLight}
                    />
                    <Text style={[styles.sortText, isSelected && styles.sortTextActive]}>
                      {so.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer CTA Buttons */}
          <View style={styles.footer}>
            <Pressable style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Reset All</Text>
            </Pressable>
            <Pressable style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AuraColors.text,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: AuraColors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: AuraColors.textMuted,
  },
  segmentTextActive: {
    color: AuraColors.primaryDark,
    fontWeight: '800',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: AuraColors.text,
  },
  rangeDivider: {
    fontSize: 16,
    color: AuraColors.textLight,
  },
  numberRow: {
    flexDirection: 'row',
    gap: 8,
  },
  numChip: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  numChipActive: {
    backgroundColor: AuraColors.primary,
    borderColor: AuraColors.primary,
  },
  numChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: AuraColors.textSecondary,
  },
  numChipTextActive: {
    color: '#ffffff',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  sortRowActive: {
    backgroundColor: AuraColors.primaryLight,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600',
    color: AuraColors.textSecondary,
  },
  sortTextActive: {
    color: AuraColors.primaryDark,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: AuraColors.textSecondary,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: AuraColors.primary,
    shadowColor: AuraColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});

export default PropertyFiltersModal;

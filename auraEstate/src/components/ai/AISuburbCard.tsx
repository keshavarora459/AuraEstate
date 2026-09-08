import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { ParsedSuburbInsight } from '../../utils/aiResponseParser';

interface AISuburbCardProps {
  insight: ParsedSuburbInsight;
}

export const AISuburbCard: React.FC<AISuburbCardProps> = ({ insight }) => {
  const router = useRouter();

  const handleExplore = () => {
    // Navigate to explore screen with suburb filter
    router.push({
      pathname: '/(tabs)/explore',
      params: { suburb: insight.suburb.split(',')[0].trim() },
    });
  };

  return (
    <View style={styles.container}>
      {/* Suburb Header */}
      <View style={styles.header}>
        <View style={styles.suburbTitleRow}>
          <Ionicons name="location" size={16} color={AuraColors.primaryDark} />
          <Text style={styles.suburbName}>{insight.suburb}</Text>
        </View>
        <View style={styles.marketBadge}>
          <Text style={styles.marketBadgeText}>Market Overview</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        {insight.averagePrice && (
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Average Price</Text>
            <Text style={styles.metricValue} numberOfLines={1}>
              {insight.averagePrice}
            </Text>
          </View>
        )}

        {insight.listingsCount && (
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Available</Text>
            <Text style={styles.metricValue}>
              {insight.listingsCount} Listings
            </Text>
          </View>
        )}

        {insight.recentSales && (
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Recent Sales</Text>
            <Text style={styles.metricValue}>
              {insight.recentSales}
            </Text>
          </View>
        )}
      </View>

      {/* Overview Description */}
      {insight.overview ? (
        <Text style={styles.overviewText}>
          {insight.overview}
        </Text>
      ) : null}

      {/* Action Link */}
      <Pressable style={styles.actionBtn} onPress={handleExplore}>
        <Text style={styles.actionBtnText}>Explore {insight.suburb.split(',')[0].trim()} Properties</Text>
        <Ionicons name="arrow-forward" size={13} color={AuraColors.primaryDark} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 10,
    marginBottom: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  suburbTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  suburbName: {
    fontSize: 15,
    fontWeight: '900',
    color: AuraColors.text,
  },
  marketBadge: {
    backgroundColor: AuraColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  marketBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: AuraColors.primaryDark,
    letterSpacing: 0.3,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: AuraColors.textSecondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '900',
    color: AuraColors.primaryDark,
    textAlign: 'center',
  },
  overviewText: {
    fontSize: 12,
    lineHeight: 18,
    color: AuraColors.textSecondary,
    marginBottom: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: AuraColors.primaryDark,
  },
});

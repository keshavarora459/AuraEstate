import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { ParsedStat } from '../../utils/aiResponseParser';

interface AIMarketStatsProps {
  stats: ParsedStat[];
  title?: string;
  explanation?: string;
}

export const AIMarketStats: React.FC<AIMarketStatsProps> = ({
  stats,
  title,
  explanation,
}) => {
  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Ionicons name="bar-chart-outline" size={15} color={AuraColors.primaryDark} />
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statTile}>
            <View style={styles.statIconWrap}>
              <Ionicons
                name={(stat.icon as any) || 'trending-up-outline'}
                size={14}
                color={AuraColors.primaryDark}
              />
            </View>
            <Text style={styles.statValue} numberOfLines={1}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel} numberOfLines={1}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {explanation && (
        <Text style={styles.explanationText}>
          {explanation}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
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
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AuraColors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statTile: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: AuraColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
    color: AuraColors.primaryDark,
    marginBottom: 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: AuraColors.textSecondary,
    textAlign: 'center',
  },
  explanationText: {
    fontSize: 11,
    color: AuraColors.textSecondary,
    marginTop: 10,
    lineHeight: 16,
  },
});

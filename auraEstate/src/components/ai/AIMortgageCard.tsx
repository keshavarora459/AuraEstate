import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { ParsedMortgage } from '../../utils/aiResponseParser';

interface AIMortgageCardProps {
  mortgage: ParsedMortgage;
}

export const AIMortgageCard: React.FC<AIMortgageCardProps> = ({ mortgage }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="calculator-outline" size={16} color={AuraColors.primaryDark} />
        </View>
        <Text style={styles.headerTitle}>Mortgage Estimate</Text>
      </View>

      {/* Parameter Rows */}
      <View style={styles.paramsBox}>
        {mortgage.propertyPrice && (
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Property price</Text>
            <Text style={styles.paramValue}>{mortgage.propertyPrice}</Text>
          </View>
        )}

        {mortgage.deposit && (
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Deposit</Text>
            <Text style={styles.paramValue}>{mortgage.deposit}</Text>
          </View>
        )}

        {mortgage.loanAmount && (
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Loan amount</Text>
            <Text style={styles.paramValue}>{mortgage.loanAmount}</Text>
          </View>
        )}

        {mortgage.interestRate && (
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Interest rate</Text>
            <Text style={styles.paramValue}>{mortgage.interestRate}</Text>
          </View>
        )}

        {mortgage.loanTerm && (
          <View style={[styles.paramRow, styles.paramRowLast]}>
            <Text style={styles.paramLabel}>Loan term</Text>
            <Text style={styles.paramValue}>{mortgage.loanTerm}</Text>
          </View>
        )}
      </View>

      {/* Repayment Box */}
      <View style={styles.repaymentBox}>
        <Text style={styles.repaymentLabel}>Estimated monthly repayment</Text>
        <Text style={styles.repaymentValue}>{mortgage.monthlyRepayment}</Text>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerRow}>
        <Ionicons name="information-circle-outline" size={13} color={AuraColors.textLight} />
        <Text style={styles.disclaimerText}>
          {mortgage.note || 'This is an estimate only and not financial advice.'}
        </Text>
      </View>
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
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: AuraColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: AuraColors.text,
  },
  paramsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  paramRowLast: {
    borderBottomWidth: 0,
  },
  paramLabel: {
    fontSize: 12,
    color: AuraColors.textSecondary,
    fontWeight: '600',
  },
  paramValue: {
    fontSize: 12,
    fontWeight: '800',
    color: AuraColors.text,
  },
  repaymentBox: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    alignItems: 'center',
  },
  repaymentLabel: {
    fontSize: 11,
    color: '#065f46',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  repaymentValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#047857',
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    justifyContent: 'center',
  },
  disclaimerText: {
    fontSize: 10,
    color: AuraColors.textLight,
    fontStyle: 'italic',
  },
});

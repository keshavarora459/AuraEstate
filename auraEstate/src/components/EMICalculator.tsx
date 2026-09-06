import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../constants/colors';

interface EMICalculatorProps {
  defaultPrice?: number;
}

export const EMICalculator: React.FC<EMICalculatorProps> = ({ defaultPrice = 1200000 }) => {
  const [propertyPrice, setPropertyPrice] = useState<number>(defaultPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(6.2);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);

  const downPayment = (propertyPrice * downPaymentPercent) / 100;
  const principal = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;

  const monthlyRepayment =
    monthlyRate > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : principal / totalMonths;

  const totalPayment = monthlyRepayment * totalMonths;
  const totalInterest = totalPayment - principal;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="calculator-outline" size={20} color={AuraColors.primary} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Mortgage & Loan Calculator</Text>
          <Text style={styles.subtitle}>Estimate your monthly property loan repayments</Text>
        </View>
      </View>

      {/* Summary Card */}
      <View style={styles.resultCard}>
        <Text style={styles.resultLabel}>ESTIMATED MONTHLY REPAYMENT</Text>
        <Text style={styles.resultAmount}>
          ${Math.round(monthlyRepayment).toLocaleString()}{' '}
          <Text style={styles.resultPerMonth}>/ month</Text>
        </Text>

        <View style={styles.resultDivider} />

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Principal Loan:</Text>
          <Text style={styles.breakdownValue}>${Math.round(principal).toLocaleString()}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Total Interest:</Text>
          <Text style={styles.breakdownValue}>${Math.round(totalInterest).toLocaleString()}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Total Payment:</Text>
          <Text style={styles.breakdownValue}>${Math.round(totalPayment).toLocaleString()}</Text>
        </View>
      </View>

      {/* Inputs / Quick Adjusters */}
      <View style={styles.controlsSection}>
        {/* Price control */}
        <View style={styles.controlGroup}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlLabel}>Property Price</Text>
            <Text style={styles.controlValue}>${propertyPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.buttonRow}>
            {[-200000, -50000, 50000, 200000].map((delta) => (
              <Pressable
                key={delta}
                style={styles.adjustBtn}
                onPress={() => setPropertyPrice((p) => Math.max(100000, p + delta))}
              >
                <Text style={styles.adjustBtnText}>{delta > 0 ? `+${delta / 1000}k` : `${delta / 1000}k`}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Down payment control */}
        <View style={styles.controlGroup}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlLabel}>Down Payment ({downPaymentPercent}%)</Text>
            <Text style={styles.controlValue}>${Math.round(downPayment).toLocaleString()}</Text>
          </View>
          <View style={styles.buttonRow}>
            {[10, 15, 20, 25, 30].map((pct) => (
              <Pressable
                key={pct}
                style={[styles.adjustBtn, downPaymentPercent === pct && styles.adjustBtnActive]}
                onPress={() => setDownPaymentPercent(pct)}
              >
                <Text style={[styles.adjustBtnText, downPaymentPercent === pct && styles.adjustBtnTextActive]}>
                  {pct}%
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Interest rate control */}
        <View style={styles.controlGroup}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlLabel}>Interest Rate</Text>
            <Text style={styles.controlValue}>{interestRate.toFixed(1)}% p.a.</Text>
          </View>
          <View style={styles.buttonRow}>
            {[5.5, 6.0, 6.2, 6.5, 7.0].map((rate) => (
              <Pressable
                key={rate}
                style={[styles.adjustBtn, interestRate === rate && styles.adjustBtnActive]}
                onPress={() => setInterestRate(rate)}
              >
                <Text style={[styles.adjustBtnText, interestRate === rate && styles.adjustBtnTextActive]}>
                  {rate}%
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Loan Term */}
        <View style={styles.controlGroup}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlLabel}>Loan Duration</Text>
            <Text style={styles.controlValue}>{loanTermYears} Years</Text>
          </View>
          <View style={styles.buttonRow}>
            {[15, 20, 25, 30].map((yrs) => (
              <Pressable
                key={yrs}
                style={[styles.adjustBtn, loanTermYears === yrs && styles.adjustBtnActive]}
                onPress={() => setLoanTermYears(yrs)}
              >
                <Text style={[styles.adjustBtnText, loanTermYears === yrs && styles.adjustBtnTextActive]}>
                  {yrs} Yrs
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    padding: 18,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AuraColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: AuraColors.text,
  },
  subtitle: {
    fontSize: 11,
    color: AuraColors.textMuted,
    marginTop: 2,
  },
  resultCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    padding: 16,
    marginBottom: 18,
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: AuraColors.textMuted,
    letterSpacing: 0.8,
  },
  resultAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: AuraColors.primaryDark,
    marginTop: 4,
  },
  resultPerMonth: {
    fontSize: 14,
    fontWeight: '500',
    color: AuraColors.textMuted,
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  breakdownLabel: {
    fontSize: 12,
    color: AuraColors.textMuted,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.text,
  },
  controlsSection: {
    gap: 14,
  },
  controlGroup: {
    gap: 6,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.textSecondary,
  },
  controlValue: {
    fontSize: 13,
    fontWeight: '800',
    color: AuraColors.primaryDark,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 6,
  },
  adjustBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustBtnActive: {
    backgroundColor: AuraColors.primary,
  },
  adjustBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AuraColors.textSecondary,
  },
  adjustBtnTextActive: {
    color: '#ffffff',
  },
});

export default EMICalculator;

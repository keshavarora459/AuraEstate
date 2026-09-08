import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { ParsedStep } from '../../utils/aiResponseParser';

interface AIStepGuideProps {
  steps: ParsedStep[];
  title?: string;
}

export const AIStepGuide: React.FC<AIStepGuideProps> = ({ steps, title }) => {
  const router = useRouter();

  const handleLink = (url?: string) => {
    if (!url) return;
    if (url.startsWith('/properties') || url === '/properties') {
      router.push('/(tabs)/explore' as any);
    } else if (url.startsWith('/')) {
      router.push(url as any);
    }
  };

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Ionicons name="map-outline" size={15} color={AuraColors.primaryDark} />
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      )}

      <View style={styles.stepsList}>
        {steps.map((step) => (
          <View key={step.number} style={styles.stepItem}>
            {/* Number Badge */}
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{step.number}</Text>
            </View>

            {/* Step Content */}
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.description}</Text>

              {step.linkText && step.linkUrl && (
                <Pressable
                  style={styles.stepLinkBtn}
                  onPress={() => handleLink(step.linkUrl)}
                >
                  <Text style={styles.stepLinkText}>{step.linkText}</Text>
                  <Ionicons name="arrow-forward" size={11} color={AuraColors.primaryDark} />
                </Pressable>
              )}
            </View>
          </View>
        ))}
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
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AuraColors.text,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 10,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AuraColors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AuraColors.text,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: AuraColors.textSecondary,
    lineHeight: 17,
  },
  stepLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  stepLinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: AuraColors.primaryDark,
  },
});

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { parseAIResponse, AIBlock } from '../../utils/aiResponseParser';
import { AIPropertyCard } from './AIPropertyCard';
import { AIMortgageCard } from './AIMortgageCard';
import { AISuburbCard } from './AISuburbCard';
import { AIMarketStats } from './AIMarketStats';
import { AIAgentCard } from './AIAgentCard';
import { AIStepGuide } from './AIStepGuide';
import { AIFormattedText } from './AIFormattedText';

interface AIMessageRendererProps {
  text: string;
  onNavigateProperty?: (id: string) => void;
}

export const AIMessageRenderer: React.FC<AIMessageRendererProps> = ({
  text,
  onNavigateProperty,
}) => {
  const router = useRouter();

  // Parse raw markdown/API text into structured blocks
  const parsed = useMemo(() => parseAIResponse(text), [text]);

  const handlePropertyPress = (id: string) => {
    if (onNavigateProperty) {
      onNavigateProperty(id);
    } else if (id) {
      router.push(`/property/${id}` as any);
    }
  };

  const renderBlock = (block: AIBlock, index: number) => {
    switch (block.type) {
      case 'property_list':
        return (
          <View key={index} style={styles.propertyListContainer}>
            {block.properties.map((p, pIdx) => (
              <AIPropertyCard
                key={p.id || pIdx}
                property={p}
                onPress={() => handlePropertyPress(p.id)}
              />
            ))}
          </View>
        );

      case 'single_property':
        return (
          <View key={index} style={styles.singlePropertyContainer}>
            <AIPropertyCard
              property={block.property}
              isSingle
              highlightTitle={block.highlightTitle}
              onPress={() => handlePropertyPress(block.property.id)}
            />
          </View>
        );

      case 'suburb_insight':
        return <AISuburbCard key={index} insight={block.insight} />;

      case 'mortgage_summary':
        return <AIMortgageCard key={index} mortgage={block.mortgage} />;

      case 'market_stats':
        return (
          <AIMarketStats
            key={index}
            stats={block.stats}
            title={block.title}
            explanation={block.explanation}
          />
        );

      case 'agent_list':
        return <AIAgentCard key={index} agents={block.agents} title={block.title} />;

      case 'step_guide':
        return <AIStepGuide key={index} steps={block.steps} title={block.title} />;

      case 'formatted_text':
        return <AIFormattedText key={index} content={block.content} />;

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Universal Concierge Branding Header */}
      <View style={styles.aiBadgeRow}>
        <View style={styles.sparkleIconBox}>
          <Ionicons name="sparkles" size={12} color="#ffffff" />
        </View>
        <Text style={styles.aiBadgeText}>Aura Real Estate AI</Text>
      </View>

      {/* Intro Text if present */}
      {parsed.introText ? (
        <View style={styles.introTextBox}>
          <AIFormattedText content={parsed.introText} />
        </View>
      ) : null}

      {/* Structured Content Blocks */}
      <View style={styles.blocksContainer}>
        {parsed.blocks.map((block, idx) => renderBlock(block, idx))}
      </View>

      {/* Outro Text if present */}
      {parsed.outroText ? (
        <View style={styles.outroTextBox}>
          <AIFormattedText content={parsed.outroText} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  aiBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sparkleIconBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: AuraColors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: AuraColors.primaryDark,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  introTextBox: {
    marginBottom: 4,
  },
  blocksContainer: {
    width: '100%',
  },
  propertyListContainer: {
    width: '100%',
    gap: 4,
  },
  singlePropertyContainer: {
    width: '100%',
  },
  outroTextBox: {
    marginTop: 8,
  },
});

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AuraColors } from '../../constants/colors';

interface AIFormattedTextProps {
  content: string;
}

/**
 * Helper to parse inline **bold**, *italic*, and [link](url) inside a string line
 */
function renderInlineContent(
  text: string,
  router: ReturnType<typeof useRouter>,
  baseStyle: any = styles.paragraphText
) {
  // Regex splitting by:
  // 1) [label](url)
  // 2) **bold**
  // 3) *italic*
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Link: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const label = linkMatch[1].replace(/\*\*/g, '');
      const url = linkMatch[2];

      const handlePress = () => {
        const propMatch = url.match(/\/properties\/([a-zA-Z0-9_-]+)/);
        if (propMatch) {
          router.push(`/property/${propMatch[1]}` as any);
        } else if (url.startsWith('/properties') || url === '/properties') {
          router.push('/(tabs)/explore' as any);
        } else if (url.startsWith('/')) {
          router.push(url as any);
        }
      };

      return (
        <Text
          key={index}
          style={[baseStyle, styles.inlineLinkText]}
          onPress={handlePress}
        >
          {label}
        </Text>
      );
    }

    // Bold: **text**
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return (
        <Text key={index} style={[baseStyle, styles.boldText]}>
          {boldMatch[1]}
        </Text>
      );
    }

    // Italic: *text*
    const italicMatch = part.match(/^\*([^*]+)\*$/);
    if (italicMatch) {
      return (
        <Text key={index} style={[baseStyle, styles.italicText]}>
          {italicMatch[1]}
        </Text>
      );
    }

    // Regular text (clean any remaining stray markdown characters)
    const cleaned = part.replace(/[*_~`]/g, '');
    return (
      <Text key={index} style={baseStyle}>
        {cleaned}
      </Text>
    );
  });
}

export const AIFormattedText: React.FC<AIFormattedTextProps> = ({ content }) => {
  const router = useRouter();

  if (!content) return null;

  const rawLines = content.split('\n');

  // Group consecutive lines into blocks (headers, bullets, numbered, paragraphs)
  return (
    <View style={styles.container}>
      {rawLines.map((line, lineIndex) => {
        const trimmed = line.trim();
        if (!trimmed) {
          // Spacer between paragraphs
          return <View key={lineIndex} style={styles.paragraphSpacer} />;
        }

        // Header 1, 2, 3: ### Heading
        if (trimmed.startsWith('#')) {
          const headerText = trimmed.replace(/^#{1,6}\s*/, '').replace(/\*\*/g, '');
          return (
            <Text key={lineIndex} style={styles.headingText}>
              {headerText}
            </Text>
          );
        }

        // Bullet point: - item or * item
        if (/^[-*•]\s+/.test(trimmed)) {
          const itemText = trimmed.replace(/^[-*•]\s+/, '');
          return (
            <View key={lineIndex} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletContent}>
                {renderInlineContent(itemText, router, styles.bulletContent)}
              </Text>
            </View>
          );
        }

        // Numbered item: 1. item
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          const num = numberedMatch[1];
          const itemText = numberedMatch[2];
          return (
            <View key={lineIndex} style={styles.numberedRow}>
              <Text style={styles.numberBadge}>{num}.</Text>
              <Text style={styles.numberedContent}>
                {renderInlineContent(itemText, router, styles.numberedContent)}
              </Text>
            </View>
          );
        }

        // Regular paragraph
        return (
          <Text key={lineIndex} style={styles.paragraphText}>
            {renderInlineContent(trimmed, router, styles.paragraphText)}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
  },
  paragraphSpacer: {
    height: 8,
  },
  paragraphText: {
    fontSize: 13,
    lineHeight: 20,
    color: AuraColors.text,
  },
  boldText: {
    fontWeight: '800',
    color: AuraColors.text,
  },
  italicText: {
    fontStyle: 'italic',
    color: AuraColors.textSecondary,
  },
  inlineLinkText: {
    color: AuraColors.primaryDark,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  headingText: {
    fontSize: 15,
    fontWeight: '900',
    color: AuraColors.text,
    marginTop: 6,
    marginBottom: 4,
    lineHeight: 21,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: AuraColors.primaryDark,
    marginTop: 7,
    marginRight: 8,
  },
  bulletContent: {
    fontSize: 13,
    lineHeight: 19,
    color: AuraColors.text,
    flex: 1,
  },
  numberedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
    paddingLeft: 2,
  },
  numberBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: AuraColors.primaryDark,
    marginRight: 6,
    marginTop: 1,
  },
  numberedContent: {
    fontSize: 13,
    lineHeight: 19,
    color: AuraColors.text,
    flex: 1,
  },
});

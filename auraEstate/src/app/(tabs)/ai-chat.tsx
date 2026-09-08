import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { sendAIChatPrompt, fetchProperties } from '../../services/api';
import { AIMessageRenderer } from '../../components/ai/AIMessageRenderer';

const QUICK_PROMPTS = [
  'Show me all properties for sale',
  "What's the cheapest property?",
  'Show me 4+ bedroom homes',
  'Find properties in Sydney',
];

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export default function AIChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I'm Aura AI, your luxury real estate concierge 🏡\n\nAsk me anything about property prices, live database listings, mortgage estimates, suburb insights, or investment advice!",
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, loading]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    return () => {
      showSub.remove();
    };
  }, []);

  useEffect(() => {
    fetchProperties().catch(() => {});
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendAIChatPrompt(query);
      if (res.data && res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: res.data.response,
          },
        ]);
      } else {
        throw new Error('No response');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "I'm experiencing a momentary connectivity issue. Please try asking again!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: "Hello! I'm Aura AI, your luxury real estate concierge 🏡\n\nAsk me anything about property prices, live database listings, mortgage estimates, suburb insights, or investment advice!",
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={18} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>Aura AI Concierge</Text>
          </View>

          <Pressable style={styles.resetBtn} onPress={handleReset}>
            <Ionicons name="refresh-outline" size={18} color={AuraColors.textSecondary} />
          </Pressable>
        </View>

        {/* Quick Suggestion Pills */}
        <View style={styles.quickPromptsBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPromptsScroll}
            keyboardShouldPersistTaps="handled"
          >
            {QUICK_PROMPTS.map((prompt) => (
              <Pressable
                key={prompt}
                style={styles.quickPromptChip}
                onPress={() => handleSend(prompt)}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {messages.map((msg) => {
            const isMe = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[styles.messageBubble, isMe ? styles.userBubble : styles.aiBubble]}
              >
                {isMe ? (
                  <Text style={styles.userBubbleText}>{msg.text}</Text>
                ) : (
                  <AIMessageRenderer
                    text={msg.text}
                    onNavigateProperty={(id) => router.push(`/property/${id}` as any)}
                  />
                )}
              </View>
            );
          })}

          {loading && (
            <View style={[styles.messageBubble, styles.aiBubble, styles.loadingBubble]}>
              <ActivityIndicator size="small" color={AuraColors.primaryDark} />
              <Text style={styles.thinkingText}>Aura AI is querying property database...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.chatInput}
            placeholder="Ask about properties, suburbs, prices..."
            placeholderTextColor={AuraColors.textLight}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={400}
          />
          <Pressable
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={18} color="#ffffff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: AuraColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: AuraColors.text,
  },
  resetBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  quickPromptsBar: {
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  quickPromptsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickPromptChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickPromptText: {
    fontSize: 11,
    fontWeight: '600',
    color: AuraColors.textSecondary,
  },
  messagesScroll: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesContainer: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    borderRadius: 18,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: AuraColors.primary,
    borderBottomRightRadius: 4,
    maxWidth: '82%',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  userBubbleText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomLeftRadius: 4,
    maxWidth: '92%',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  thinkingText: {
    fontSize: 12,
    color: AuraColors.primaryDark,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    maxHeight: 100,
    color: AuraColors.text,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AuraColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});

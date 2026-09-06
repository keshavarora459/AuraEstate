import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { fetchChatInbox, sendChatMessage, markThreadRead, deleteChatThread } from '../services/api';

export const InboxPanel: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<any | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);

  const loadInbox = async () => {
    try {
      const res = await fetchChatInbox();
      if (res.data && res.data.success) {
        setThreads(res.data.threads || []);
        if (res.data.threads?.length > 0 && !activeThread) {
          setActiveThread(res.data.threads[0]);
        } else if (activeThread) {
          const updated = res.data.threads.find(
            (t: any) => t.threadId === activeThread.threadId
          );
          if (updated) setActiveThread(updated);
        }
      }
    } catch (err) {
      console.error('Error loading inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
    const interval = setInterval(loadInbox, 5000);

    if (socket) {
      const handleReceive = () => {
        loadInbox();
      };
      socket.on('receive_message', handleReceive);
      return () => {
        clearInterval(interval);
        socket.off('receive_message', handleReceive);
      };
    }

    return () => clearInterval(interval);
  }, [socket]);

  const handleSelectThread = async (thread: any) => {
    setActiveThread(thread);
    if (thread.unreadCount > 0 && thread.otherUser?._id) {
      try {
        await markThreadRead(thread.otherUser._id);
        setThreads((prev) =>
          prev.map((t) => (t.threadId === thread.threadId ? { ...t, unreadCount: 0 } : t))
        );
      } catch (e) {}
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeThread || !user) return;
    const textToSend = replyText.trim();
    setReplyText('');
    setSending(true);

    try {
      const res = await sendChatMessage({
        receiverId: activeThread.otherUser?._id,
        propertyId: activeThread.propertyId?._id || activeThread.propertyId,
        text: textToSend,
      });

      if (res.data && res.data.message) {
        setActiveThread((prev: any) => ({
          ...prev,
          messages: [...(prev.messages || []), res.data.message],
        }));
        loadInbox();
      }
    } catch (e) {
      console.error('Failed to send reply', e);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color={AuraColors.primary} />
        <Text style={styles.loadingText}>Loading Messages...</Text>
      </View>
    );
  }

  if (threads.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={48} color={AuraColors.textLight} />
        <Text style={styles.emptyTitle}>Your Inbox is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Incoming inquiries and live client conversations will appear here in real-time.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Thread list strip (horizontal or tabs) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.threadScroll}>
        {threads.map((t) => {
          const isSelected = activeThread?.threadId === t.threadId;
          const otherName = t.otherUser?.name || 'Client';
          return (
            <Pressable
              key={t.threadId}
              style={[styles.threadChip, isSelected && styles.threadChipActive]}
              onPress={() => handleSelectThread(t)}
            >
              <Text style={[styles.threadChipText, isSelected && styles.threadChipTextActive]} numberOfLines={1}>
                {otherName}
              </Text>
              {t.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{t.unreadCount}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Active Conversation Messages */}
      {activeThread ? (
        <View style={styles.chatBox}>
          <View style={styles.chatHeader}>
            <View>
              <Text style={styles.chatRecipientName}>
                {activeThread.otherUser?.name || 'Client'}
              </Text>
              <Text style={styles.chatPropertyTitle} numberOfLines={1}>
                {activeThread.propertyId?.title || 'General Property Inquiry'}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.chatMessages} showsVerticalScrollIndicator={false}>
            {(activeThread.messages || []).map((msg: any, i: number) => {
              const isMe = msg.senderId === user?._id || msg.senderId?._id === user?._id;
              return (
                <View
                  key={msg._id || i}
                  style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleThem]}
                >
                  <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextThem]}>
                    {msg.text}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Quick Reply Bar */}
          <View style={styles.replyBar}>
            <TextInput
              style={styles.replyInput}
              placeholder="Type reply..."
              placeholderTextColor={AuraColors.textLight}
              value={replyText}
              onChangeText={setReplyText}
            />
            <Pressable
              style={[styles.sendBtn, (!replyText.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSendReply}
              disabled={!replyText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="send" size={16} color="#ffffff" />
              )}
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AuraColors.cardBorder,
    overflow: 'hidden',
    minHeight: 350,
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: AuraColors.textMuted,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AuraColors.text,
  },
  emptySubtitle: {
    fontSize: 12,
    color: AuraColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  threadScroll: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  threadChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  threadChipActive: {
    backgroundColor: AuraColors.primaryLight,
    borderColor: AuraColors.primary,
  },
  threadChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: AuraColors.textSecondary,
    maxWidth: 120,
  },
  threadChipTextActive: {
    color: AuraColors.primaryDark,
  },
  unreadBadge: {
    backgroundColor: AuraColors.rose,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  chatBox: {
    flex: 1,
  },
  chatHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  chatRecipientName: {
    fontSize: 14,
    fontWeight: '800',
    color: AuraColors.text,
  },
  chatPropertyTitle: {
    fontSize: 11,
    color: AuraColors.primaryDark,
    fontWeight: '600',
  },
  chatMessages: {
    padding: 14,
    maxHeight: 240,
  },
  msgBubble: {
    maxWidth: '82%',
    padding: 10,
    borderRadius: 14,
    marginBottom: 8,
  },
  msgBubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: AuraColors.primary,
  },
  msgBubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
  },
  msgText: {
    fontSize: 12,
    lineHeight: 16,
  },
  msgTextMe: {
    color: '#ffffff',
  },
  msgTextThem: {
    color: AuraColors.text,
  },
  replyBar: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: AuraColors.text,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AuraColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});

export default InboxPanel;

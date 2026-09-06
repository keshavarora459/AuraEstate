import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { fetchChatMessages, sendChatMessage, sendGuestMessage } from '../services/api';

interface LiveChatModalProps {
  visible: boolean;
  onClose: () => void;
  agent?: any;
  property?: any;
}

export const LiveChatModal: React.FC<LiveChatModalProps> = ({
  visible,
  onClose,
  agent,
  property,
}) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);

  // Guest inquiry form if not logged in
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestMode, setGuestMode] = useState<boolean>(!user);

  const scrollViewRef = useRef<ScrollView>(null);

  const recipient = agent || property?.agentId || property?.ownerId;
  const receiverId = recipient?._id ? String(recipient._id) : recipient ? String(recipient) : 'default';

  const recipientName = recipient?.name || property?.agentId?.name || 'Aura Verified Agent';
  const recipientAvatar =
    recipient?.avatar ||
    property?.agentId?.avatar ||
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200';

  useEffect(() => {
    if (!visible || !receiverId) return;

    const loadHistory = async () => {
      setLoading(true);
      try {
        const res = await fetchChatMessages(receiverId, property?._id);
        if (res.data && res.data.success) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error('Chat history error', err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();

    if (socket) {
      const handleReceive = (msg: any) => {
        const msgSender = msg.senderId?._id || msg.senderId;
        const msgReceiver = msg.receiverId?._id || msg.receiverId;
        if (msgSender === receiverId || msgReceiver === receiverId) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        }
      };

      socket.on('receive_message', handleReceive);
      return () => {
        socket.off('receive_message', handleReceive);
      };
    }
  }, [visible, receiverId, property?._id, socket]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setInput('');
    setSending(true);

    try {
      if (user) {
        const res = await sendChatMessage({
          receiverId,
          propertyId: property?._id,
          text,
        });
        if (res.data && res.data.message) {
          setMessages((prev) => [...prev, res.data.message]);
        }
      } else {
        if (!guestName || !guestEmail) {
          alert('Please enter your name and email to proceed as guest.');
          setSending(false);
          return;
        }
        await sendGuestMessage({
          receiverId,
          propertyId: property?._id,
          text,
          guestName,
          guestEmail,
          guestPhone,
        });
        setMessages((prev) => [
          ...prev,
          {
            _id: `g-${Date.now()}`,
            senderId: 'me',
            text: `[Enquiry from ${guestName}] ${text}`,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.error('Send message error', e);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.agentInfo}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: recipientAvatar }} style={styles.avatar} />
                <View style={styles.onlineDot} />
              </View>
              <View>
                <Text style={styles.agentName}>{recipientName}</Text>
                <Text style={styles.agentRole}>
                  {property?.title ? property.title : 'Licensed Real Estate Agent'}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Ionicons name="close" size={24} color={AuraColors.text} />
            </Pressable>
          </View>

          {/* Messages Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loaderCenter}>
                <ActivityIndicator color={AuraColors.primary} />
                <Text style={styles.loaderText}>Connecting to encrypted chat...</Text>
              </View>
            ) : messages.length === 0 ? (
              <View style={styles.emptyCenter}>
                <Ionicons name="chatbubbles-outline" size={40} color={AuraColors.textLight} />
                <Text style={styles.emptyTitle}>Start a Conversation</Text>
                <Text style={styles.emptySubtitle}>
                  Ask {recipientName} about property pricing, upcoming inspections, or custom offers.
                </Text>
              </View>
            ) : (
              messages.map((msg, i) => {
                const isMe =
                  msg.senderId === 'me' ||
                  msg.senderId === user?._id ||
                  msg.senderId?._id === user?._id;
                return (
                  <View
                    key={msg._id || i}
                    style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}
                  >
                    <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
                      {msg.text}
                    </Text>
                    <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Guest fields if not logged in */}
          {!user && guestMode && (
            <View style={styles.guestFieldsBox}>
              <Text style={styles.guestTitle}>Guest Contact Details</Text>
              <View style={styles.guestRow}>
                <TextInput
                  style={styles.guestInput}
                  placeholder="Your Name *"
                  placeholderTextColor={AuraColors.textLight}
                  value={guestName}
                  onChangeText={setGuestName}
                />
                <TextInput
                  style={styles.guestInput}
                  placeholder="Email Address *"
                  placeholderTextColor={AuraColors.textLight}
                  keyboardType="email-address"
                  value={guestEmail}
                  onChangeText={setGuestEmail}
                />
              </View>
            </View>
          )}

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type your message..."
              placeholderTextColor={AuraColors.textLight}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />
            <Pressable
              style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="send" size={18} color="#ffffff" />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: AuraColors.emerald,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  agentName: {
    fontSize: 15,
    fontWeight: '800',
    color: AuraColors.text,
  },
  agentRole: {
    fontSize: 11,
    color: AuraColors.primaryDark,
    fontWeight: '600',
    maxWidth: 220,
  },
  closeBtn: {
    padding: 6,
  },
  messagesScroll: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesContainer: {
    padding: 16,
    gap: 10,
  },
  loaderCenter: {
    padding: 40,
    alignItems: 'center',
    gap: 10,
  },
  loaderText: {
    fontSize: 12,
    color: AuraColors.textMuted,
  },
  emptyCenter: {
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
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: AuraColors.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  myText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  theirText: {
    color: AuraColors.text,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirTimeText: {
    color: AuraColors.textLight,
  },
  guestFieldsBox: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  guestTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: AuraColors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  guestRow: {
    flexDirection: 'row',
    gap: 8,
  },
  guestInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 11,
    color: AuraColors.text,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AuraColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});

export default LiveChatModal;

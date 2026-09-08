import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuraColors } from '../../constants/colors';
import { ParsedAgent } from '../../utils/aiResponseParser';

interface AIAgentCardProps {
  agents: ParsedAgent[];
  title?: string;
}

export const AIAgentCard: React.FC<AIAgentCardProps> = ({ agents, title }) => {
  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {});
    }
  };

  const handleEmail = (email?: string) => {
    if (email) {
      Linking.openURL(`mailto:${email}`).catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={15} color={AuraColors.primaryDark} />
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      )}

      <View style={styles.agentList}>
        {agents.map((agent, i) => {
          const initials = agent.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return (
            <View key={i} style={[styles.agentRow, i > 0 && styles.agentRowBorder]}>
              {/* Avatar Initial */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>

              {/* Info */}
              <View style={styles.infoCol}>
                <View style={styles.nameRow}>
                  <Text style={styles.agentName} numberOfLines={1}>
                    {agent.name}
                  </Text>
                  <Ionicons name="checkmark-circle" size={12} color={AuraColors.primary} />
                </View>

                {agent.agency && (
                  <Text style={styles.agentAgency} numberOfLines={1}>
                    {agent.agency}
                  </Text>
                )}

                {agent.precinct && (
                  <View style={styles.precinctBadge}>
                    <Text style={styles.precinctText} numberOfLines={1}>
                      {agent.precinct}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsCol}>
                {agent.phone && (
                  <Pressable
                    style={styles.iconBtn}
                    onPress={() => handleCall(agent.phone)}
                    hitSlop={6}
                  >
                    <Ionicons name="call" size={13} color="#ffffff" />
                  </Pressable>
                )}
                {agent.email && (
                  <Pressable
                    style={[styles.iconBtn, styles.emailBtn]}
                    onPress={() => handleEmail(agent.email)}
                    hitSlop={6}
                  >
                    <Ionicons name="mail" size={13} color={AuraColors.primaryDark} />
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
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
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AuraColors.text,
  },
  agentList: {
    gap: 10,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  agentRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AuraColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: AuraColors.primaryDark,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agentName: {
    fontSize: 13,
    fontWeight: '800',
    color: AuraColors.text,
  },
  agentAgency: {
    fontSize: 11,
    color: AuraColors.textSecondary,
    fontWeight: '500',
  },
  precinctBadge: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  precinctText: {
    fontSize: 9,
    color: AuraColors.textMuted,
    fontWeight: '600',
  },
  actionsCol: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: AuraColors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailBtn: {
    backgroundColor: AuraColors.primaryLight,
  },
});

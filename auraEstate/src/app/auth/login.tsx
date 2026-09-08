import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { login } = useAuth();

  const [email, setEmail] = useState(params.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login({ email: email.trim(), password });
      if (res && res.success) {
        const u = res.user;
        if (!u) {
          router.replace('/(tabs)' as any);
        } else if (u.role === 'super_admin' || u.role === 'admin') {
          router.replace('/dashboard/admin' as any);
        } else if (u.role === 'agent') {
          router.replace('/dashboard/agent' as any);
        } else {
          router.replace('/dashboard/buyer' as any);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={handleBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/(tabs)' as any)}>
              <Text style={styles.homeLink}>Back to Home</Text>
            </TouchableOpacity>
          </View>

          {/* Logo & Title */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="business" size={28} color="#ffffff" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to manage your luxury properties, offers, and agency dashboard
            </Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@company.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.forgotRow}>
              <TouchableOpacity onPress={() => router.push('/auth/forgot-password' as any)}>
                <Text style={styles.forgotText}>Forgot password or use OTP login?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Quick Demo Fill */}
            <View style={styles.demoSection}>
              <Text style={styles.demoSectionTitle}>1-TAP DEMO LOGIN</Text>
              <View style={styles.demoChipsRow}>
                <TouchableOpacity
                  style={[styles.demoChip, email === 'ishikabhatia51@gmail.com' && styles.demoChipActive]}
                  onPress={() => {
                    setEmail('ishikabhatia51@gmail.com');
                    setPassword('password123');
                    setError('');
                  }}
                >
                  <Ionicons name="briefcase-outline" size={13} color={email === 'ishikabhatia51@gmail.com' ? '#ffffff' : COLORS.primary} />
                  <Text style={[styles.demoChipText, email === 'ishikabhatia51@gmail.com' && styles.demoChipTextActive]}>Agent</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoChip, email === 'buyer@gmail.com' && styles.demoChipActive]}
                  onPress={() => {
                    setEmail('buyer@gmail.com');
                    setPassword('password123');
                    setError('');
                  }}
                >
                  <Ionicons name="home-outline" size={13} color={email === 'buyer@gmail.com' ? '#ffffff' : COLORS.primary} />
                  <Text style={[styles.demoChipText, email === 'buyer@gmail.com' && styles.demoChipTextActive]}>Buyer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoChip, email === 'seller@gmail.com' && styles.demoChipActive]}
                  onPress={() => {
                    setEmail('seller@gmail.com');
                    setPassword('password123');
                    setError('');
                  }}
                >
                  <Ionicons name="key-outline" size={13} color={email === 'seller@gmail.com' ? '#ffffff' : COLORS.primary} />
                  <Text style={[styles.demoChipText, email === 'seller@gmail.com' && styles.demoChipTextActive]}>Seller</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoChip, email === 'agency@prestigerealty.com.au' && styles.demoChipActive]}
                  onPress={() => {
                    setEmail('agency@prestigerealty.com.au');
                    setPassword('password123');
                    setError('');
                  }}
                >
                  <Ionicons name="business-outline" size={13} color={email === 'agency@prestigerealty.com.au' ? '#ffffff' : COLORS.primary} />
                  <Text style={[styles.demoChipText, email === 'agency@prestigerealty.com.au' && styles.demoChipTextActive]}>Agency</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoChip, email === 'admin@realestate.com' && styles.demoChipActive]}
                  onPress={() => {
                    setEmail('admin@realestate.com');
                    setPassword('password123');
                    setError('');
                  }}
                >
                  <Ionicons name="shield-checkmark-outline" size={13} color={email === 'admin@realestate.com' ? '#ffffff' : COLORS.primary} />
                  <Text style={[styles.demoChipText, email === 'admin@realestate.com' && styles.demoChipTextActive]}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register' as any)}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  homeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    flex: 1,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  signupLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    alignItems: 'center',
  },
  demoSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  demoChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.cardDark,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  demoChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  demoChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  demoChipTextActive: {
    color: '#ffffff',
  },
});

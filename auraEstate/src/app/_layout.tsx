import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { AuthPromptModal } from '../components/AuthPromptModal';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <StatusBar style="dark" />
          <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#f8fafc' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="property/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="agency/index" options={{ headerShown: false }} />
          <Stack.Screen name="agency/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="agents/index" options={{ headerShown: false }} />
          <Stack.Screen name="suburbs/[name]" options={{ headerShown: false }} />
          <Stack.Screen name="sold/index" options={{ headerShown: false }} />
          <Stack.Screen name="blogs/index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard/buyer" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard/seller" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard/agent" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard/agency" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard/admin" options={{ headerShown: false }} />
        </Stack>
        <AuthPromptModal />
      </SocketProvider>
    </AuthProvider>
  </SafeAreaProvider>
);
}

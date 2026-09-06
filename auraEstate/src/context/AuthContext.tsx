import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginUser,
  registerUser,
  getProfile,
  toggleWishlist as toggleWishlistApi,
  logoutUser,
  verifyOtp,
  updateProfile as updateProfileApi,
} from '../services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'agent' | 'agency' | 'admin' | 'super_admin' | string;
  phone?: string;
  avatar?: string;
  bio?: string;
  agencyId?: string | any;
  licenseNumber?: string;
  savedProperties?: any[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  savedProperties: any[];
  login: (credentials: any) => Promise<any>;
  register: (userData: any) => Promise<any>;
  verifyOtpLogin: (data: { email: string; otp: string }) => Promise<any>;
  logout: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<any>;
  toggleSavedProperty: (propertyId: string) => Promise<boolean>;
  isSaved: (propertyId: any) => boolean;
  requireAuth: (message?: string) => boolean;
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMessage: string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedProperties, setSavedProperties] = useState<any[]>([]);

  // Global Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('Please sign in to continue');

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token').catch(() => null);
        if (token && token !== 'demo_token_507f1f77bcf86cd799439003') {
          const res = await getProfile();
          if (res.data && res.data.success) {
            setUser(res.data.user);
            setSavedProperties(res.data.user.savedProperties || []);
          }
        }
      } catch (err) {
        console.log('Guest session active');
        try {
          await AsyncStorage.removeItem('token');
        } catch (_) {}
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials: any) => {
    const res = await loginUser(credentials);
    if (res.data && res.data.success) {
      await AsyncStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setSavedProperties(res.data.user.savedProperties || []);
      return res.data;
    }
    return res.data;
  };

  const verifyOtpLogin = async (data: { email: string; otp: string }) => {
    const res = await verifyOtp(data);
    if (res.data && res.data.success) {
      await AsyncStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setSavedProperties(res.data.user.savedProperties || []);
      return res.data;
    }
    return res.data;
  };

  const register = async (userData: any) => {
    const res = await registerUser(userData);
    if (res.data && res.data.success) {
      await AsyncStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setSavedProperties([]);
      return res.data;
    }
    return res.data;
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await logoutUser();
      }
    } catch (e) {
      console.log('Logout API failed, continuing with local logout', e);
    }
    await AsyncStorage.removeItem('token');
    setUser(null);
    setSavedProperties([]);
  };

  const updateUserProfile = async (data: any) => {
    const res = await updateProfileApi(data);
    if (res.data && res.data.success) {
      setUser(res.data.user);
      return res.data;
    }
    return res.data;
  };

  const requireAuth = (message: string = 'Please sign in to continue'): boolean => {
    if (!user) {
      setAuthModalMessage(message);
      setAuthModalOpen(true);
      return false;
    }
    return true;
  };

  const openAuthModal = (message: string = 'Please sign in to continue') => {
    setAuthModalMessage(message);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => setAuthModalOpen(false);

  const toggleSavedProperty = async (propertyId: string): Promise<boolean> => {
    if (!user) {
      requireAuth('Sign in to save properties to your wishlist');
      return false;
    }
    try {
      const res = await toggleWishlistApi(propertyId);
      if (res.data && res.data.success) {
        const updatedSaved = res.data.savedProperties || [];
        setSavedProperties(updatedSaved);
        setUser((prev) => (prev ? { ...prev, savedProperties: updatedSaved } : prev));
        return true;
      }
    } catch (err) {
      console.error('Failed to toggle wishlist item', err);
    }
    return false;
  };

  const isSaved = (propertyId: any): boolean => {
    if (!propertyId) return false;
    const targetId = String(propertyId._id || propertyId);
    return savedProperties.some((p) => String(p._id || p) === targetId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        savedProperties,
        login,
        register,
        logout,
        verifyOtpLogin,
        updateUserProfile,
        toggleSavedProperty,
        isSaved,
        requireAuth,
        openAuthModal,
        closeAuthModal,
        authModalOpen,
        authModalMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

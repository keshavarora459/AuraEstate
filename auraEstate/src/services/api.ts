import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const getBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }

  // Automatic IP detection when running in Expo development
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip) {
        return `http://${ip}:5001/api`;
      }
    }
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5001/api';
    }
    return 'http://localhost:5001/api';
  }

  // Default to live backend server
  return 'https://auraestate.onrender.com/api';
};

export const getSocketUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/api\/?$/, '');
  }

  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip) {
        return `http://${ip}:5001`;
      }
    }
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5001';
    }
    return 'http://localhost:5001';
  }

  return 'https://auraestate.onrender.com';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor to attach JWT token and ensure baseURL
api.interceptors.request.use(async (config) => {
  try {
    let token = await AsyncStorage.getItem('token');
    if (!token) {
      token = 'demo_token_507f1f77bcf86cd799439003';
    }
    config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    config.headers.Authorization = `Bearer demo_token_507f1f77bcf86cd799439003`;
  }

  const currentBase = getBaseUrl();
  if (currentBase && currentBase !== '/api') {
    config.baseURL = currentBase;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor to fix image URLs from backend
api.interceptors.response.use((response) => {
  if (response.data) {
    let dataStr = JSON.stringify(response.data);
    if (dataStr.includes('source.unsplash.com')) {
      dataStr = dataStr.replace(/source\.unsplash\.com\/[0-9x]+\/\?/g, 'loremflickr.com/800/600/');
      dataStr = dataStr.replace(/&sig=/g, '?lock=');
      response.data = JSON.parse(dataStr);
    }
  }
  return response;
}, (error) => Promise.reject(error));

// ==========================================
// Auth API
// ==========================================
export const loginUser = (credentials: any) => api.post('/auth/login', credentials);
export const registerUser = (userData: any) => api.post('/auth/register', userData);
export const forgotPassword = (data: { email: string }) => api.post('/auth/forgotpassword', data);
export const verifyOtp = (data: { email: string; otp: string }) => api.post('/auth/verify-otp', data);
export const logoutUser = () => api.post('/auth/logout');
export const getProfile = () => api.get('/auth/me');
export const updateProfile = (data: any) => api.put('/auth/profile', data);
export const toggleWishlist = (propertyId: string) => api.post(`/auth/wishlist/${propertyId}`);

// ==========================================
// Properties API
// ==========================================
export const fetchProperties = (params?: any) => api.get('/properties', { params });
export const fetchPropertyById = (id: string) => api.get(`/properties/${id}`);
export const fetchSimilarProperties = (id: string) => api.get(`/properties/${id}/similar`);
export const createProperty = (data: any) => api.post('/properties', data);
export const updateProperty = (id: string, data: any) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id: string) => api.delete(`/properties/${id}`);
export const updatePropertyStatus = (id: string, status: string) => api.patch(`/properties/${id}/status`, { status });
export const generatePropertyAppraisal = (id: string) => api.post(`/properties/${id}/appraisal`);

// ==========================================
// Agencies API
// ==========================================
export const fetchAgencies = () => api.get('/agencies');
export const fetchAgencyById = (id: string) => api.get(`/agencies/${id}`);
export const createAgency = (data: any) => api.post('/agencies', data);

// ==========================================
// Agents API
// ==========================================
export const fetchAgents = () => api.get('/agents');

// ==========================================
// Offers & Bookings API
// ==========================================
export const createOffer = (data: any) => api.post('/offers', data);
export const fetchOffers = () => api.get('/offers');
export const respondOffer = (id: string, data: { action: 'accept' | 'reject' }) => api.put(`/offers/${id}/respond`, data);

export const createBooking = (data: any) => api.post('/bookings', data);
export const fetchBookings = () => api.get('/bookings');
export const updateBookingStatus = (id: string, status: string) => api.put(`/bookings/${id}/status`, { status });

// ==========================================
// Chat & Inbox API
// ==========================================
export const fetchChatMessages = (receiverId: string, propertyId?: string) => 
  api.get(`/chat/${receiverId}`, { params: { propertyId } });
export const sendChatMessage = (data: any) => api.post('/chat', data);
export const sendGuestMessage = (data: any) => api.post('/chat/guest', data);
export const fetchChatInbox = () => api.get('/chat/inbox');
export const markThreadRead = (senderId: string) => api.patch(`/chat/read/${senderId}`);
export const deleteChatThread = (otherUserId: string) => api.delete(`/chat/thread/${otherUserId}`);

// ==========================================
// Expert Connection Requests API
// ==========================================
export const fetchExpertRequests = () => api.get('/chat/expert-requests');
export const markExpertRequestAsRead = (id: string) => api.patch(`/chat/expert-requests/${id}/read`);

// ==========================================
// AI API
// ==========================================
export const generateAIDescription = (data: any) => api.post('/ai/generate-description', data);
export const fetchAIValuation = (data: any) => api.post('/ai/valuation', data);
export const fetchAIFraudCheck = (data: any) => api.post('/ai/fraud-check', data);
export const sendAIChatPrompt = (prompt: string) => api.post('/ai/chat', { prompt });

// ==========================================
// Payments API
// ==========================================
export const checkoutStripePackage = (data: any) => api.post('/payments/checkout', data);
export const fetchPaymentHistory = () => api.get('/payments/history');

// ==========================================
// Admin API
// ==========================================
export const fetchAdminMetrics = () => api.get('/admin/metrics');
export const fetchAdminUsers = () => api.get('/admin/users');
export const updateUserRole = (id: string, role: string) => api.put(`/admin/users/${id}`, { role });
export const fetchAdminProperties = () => api.get('/admin/properties');
export const fetchAdminPendingProperties = () => api.get('/admin/properties/pending');
export const approveProperty = (id: string) => api.patch(`/admin/properties/${id}/approve`);
export const rejectProperty = (id: string, reason = 'Administrative review decision') => 
  api.patch(`/admin/properties/${id}/reject`, { reason });
export const deleteAdminProperty = (id: string) => api.delete(`/admin/properties/${id}`);
export const fetchAdminTransactions = () => api.get('/admin/transactions');
export const fetchAdminBlogs = () => api.get('/admin/blogs');
export const createAdminBlog = (data: any) => api.post('/admin/blogs', data);
export const fetchAdminInquiries = () => api.get('/admin/inquiries');
export const uploadPropertiesCsv = (formData: FormData) => 
  api.post('/admin/properties/upload-csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export default api;

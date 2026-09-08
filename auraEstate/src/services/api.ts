import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { cacheProperties, cacheProperty } from '../utils/propertyCache';

const DEFAULT_FALLBACK_API_URL = 'https://aura-estate-tau.vercel.app/api';

export const getBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || DEFAULT_FALLBACK_API_URL;
  const trimmed = envUrl.trim();
  if (trimmed) {
    return trimmed.endsWith('/api') ? trimmed : `${trimmed.replace(/\/$/, '')}/api`;
  }
  return DEFAULT_FALLBACK_API_URL;
};

export const getSocketUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || DEFAULT_FALLBACK_API_URL;
  const trimmed = envUrl.trim();
  if (trimmed) {
    return trimmed.replace(/\/api\/?$/, '').replace(/\/$/, '');
  }
  return 'https://aura-estate-tau.vercel.app';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
  timeout: 30000,
});

// Interceptor to attach JWT token and ensure baseURL
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // Ignore error reading token
  }

  config.headers['Bypass-Tunnel-Reminder'] = 'true';

  const currentBase = getBaseUrl();
  if (currentBase) {
    config.baseURL = currentBase;
  }
  console.log(`[API REQUEST] ${config.method?.toUpperCase()} -> ${config.baseURL}${config.url}`);
  return config;
}, (error) => Promise.reject(error));

// Interceptor to fix image URLs from backend
api.interceptors.response.use((response) => {
  console.log(`[API RESPONSE ${response.status}] ${response.config.url}`);
  if (response.data) {
    let dataStr = JSON.stringify(response.data);
    if (dataStr.includes('source.unsplash.com')) {
      dataStr = dataStr.replace(/source\.unsplash\.com\/[0-9x]+\/\?/g, 'loremflickr.com/800/600/');
      dataStr = dataStr.replace(/&sig=/g, '?lock=');
      response.data = JSON.parse(dataStr);
    }
  }
  return response;
}, (error) => {
  console.error(`[API ERROR] ${error.message} (code: ${error.code}) URL: ${error.config?.baseURL}${error.config?.url}`);
  return Promise.reject(error);
});

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
// Candidate search term generator for typo-resilient & tokenized searching
function getSearchCandidates(search: string): string[] {
  const q = search.trim();
  const candidates: string[] = [];

  // 1. Whole phrase typo corrections:
  // e.g. "peter cullin" -> "peter cullen"
  if (/cullin/i.test(q)) {
    candidates.push(q.replace(/cullin/gi, 'cullen'));
  }
  if (/\b([a-zA-Z]{3,})in\b/i.test(q)) {
    candidates.push(q.replace(/\b([a-zA-Z]{3,})in\b/gi, '$1en'));
  }

  // 2. Individual words / tokens
  const tokens = q.split(/\s+/).filter((t) => t.length >= 3);
  if (tokens.length > 1) {
    for (const t of tokens) {
      if (/cullin/i.test(t)) {
        candidates.push('cullen');
      }
      candidates.push(t);
    }
  }

  // 3. Stems / vowel variations for individual tokens
  for (const t of tokens.length > 0 ? tokens : [q]) {
    const low = t.toLowerCase();
    if (low.includes('cullin')) candidates.push('cullen');
    if (low.endsWith('in') && low.length > 4) candidates.push(low.slice(0, -2) + 'en');
    if (low.length >= 4) candidates.push(low.slice(0, 4));
  }

  return Array.from(new Set(candidates)).filter(
    (c) => c.toLowerCase() !== q.toLowerCase() && c.length >= 3
  );
}

// Relevance ranker to guarantee exact & fuzzy matches (e.g. Peter Cullen) score at the top
export function rankPropertiesByQuery(properties: any[], query: string): any[] {
  if (!query || !properties || properties.length === 0) return properties;
  const qLower = query.toLowerCase().trim();
  const tokens = qLower.split(/\s+/).filter((t) => t.length > 0);

  const scored = properties.map((p) => {
    const title = (p.title || '').toLowerCase();
    const street = (p.street_address || '').toLowerCase();
    const address = (typeof p.address === 'string'
      ? p.address
      : `${p.address?.street || ''} ${p.address?.suburb || ''}`
    ).toLowerCase();
    const suburb = (p.suburb_name || p.suburb || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const fullText = `${title} ${street} ${address} ${suburb} ${desc}`;

    let score = 0;
    if (fullText.includes(qLower)) score += 100;
    if (title.includes(qLower) || street.includes(qLower) || address.includes(qLower)) score += 80;

    let matchedTokens = 0;
    for (const token of tokens) {
      if (title.includes(token) || street.includes(token) || address.includes(token)) {
        score += 40;
        matchedTokens++;
      } else if (suburb.includes(token)) {
        score += 25;
        matchedTokens++;
      } else if (fullText.includes(token)) {
        score += 15;
        matchedTokens++;
      } else {
        const stem = token.length >= 4 ? token.slice(0, 4) : token;
        if (title.includes(stem) || street.includes(stem) || address.includes(stem)) {
          score += 25;
          matchedTokens++;
        } else {
          try {
            const vowelRegex = new RegExp(token.replace(/[aeiou]/gi, '[aeiou]'), 'i');
            if (vowelRegex.test(title) || vowelRegex.test(street) || vowelRegex.test(address)) {
              score += 25;
              matchedTokens++;
            } else if (vowelRegex.test(fullText)) {
              score += 10;
              matchedTokens++;
            }
          } catch (_) {}
        }
      }
    }
    if (matchedTokens === tokens.length) score += 50;

    return { property: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((item) => item.property);
}

export const fetchProperties = async (params?: any) => {
  let res = await api.get('/properties', { params });

  // If search was specified and returned 0 results, retry with smart candidate terms
  if (
    params?.search &&
    typeof params.search === 'string' &&
    (!res.data?.properties || res.data.properties.length === 0)
  ) {
    const candidates = getSearchCandidates(params.search);
    const pool = new Map<string, any>();

    for (const cand of candidates) {
      try {
        const candRes = await api.get('/properties', { params: { ...params, search: cand } });
        const candProps = candRes.data?.properties || [];
        for (const p of candProps) {
          const key = String(p._id || p.id || '');
          if (key && !pool.has(key)) {
            pool.set(key, p);
          }
        }
        if (pool.size > 0) {
          break;
        }
      } catch (_) {}
    }

    if (pool.size > 0) {
      const merged = Array.from(pool.values());
      const ranked = rankPropertiesByQuery(merged, params.search);
      res = {
        ...res,
        data: {
          ...res.data,
          success: true,
          properties: ranked,
          total: ranked.length,
          totalPages: Math.ceil(ranked.length / (params.limit || 10)),
        },
      };
    }
  } else if (res.data?.properties && params?.search) {
    // Rank existing results by relevance
    res.data.properties = rankPropertiesByQuery(res.data.properties, params.search);
  }

  if (res.data?.properties) {
    cacheProperties(res.data.properties);
  }
  return res;
};

export const fetchSoldProperties = async (params?: any) => {
  const res = await api.get('/properties/sold', { params });
  if (res.data?.properties) {
    cacheProperties(res.data.properties);
  }
  return res;
};

export const fetchPropertyById = async (id: string) => {
  const res = await api.get(`/properties/${id}`);
  if (res.data?.property) {
    cacheProperty(res.data.property);
  }
  return res;
};

export const fetchSimilarProperties = (id: string) => api.get(`/properties/${id}/similar`);
export const createProperty = (data: any) => api.post('/properties', data);
export const updateProperty = (id: string, data: any) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id: string) => api.delete(`/properties/${id}`);
export const updatePropertyStatus = (id: string, status: string) => api.patch(`/properties/${id}/status`, { status });
export const generatePropertyAppraisal = (id: string) => api.post(`/properties/${id}/appraisal`);

// ==========================================
// Suburbs API
// ==========================================
export const fetchSuburbs = () => api.get('/suburbs');
export const fetchSuburbByName = (name: string) => api.get(`/suburbs/${encodeURIComponent(name)}`);

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
export const sendPropertyEnquiry = (data: { propertyId: string; agentId?: string; message?: string; phone: string; email: string; name: string }) =>
  api.post('/chat/enquiry', data);

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

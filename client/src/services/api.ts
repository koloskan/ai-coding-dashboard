import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Campaign, AnalyticsData, DashboardMetrics, ApiResponse, PaginatedResponse } from '../types';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens, etc.
api.interceptors.request.use(
  (config) => {
    // Add authorization header if token exists
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// Campaign API endpoints
export const campaignApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Campaign[]>>> => 
    api.get('/campaigns'),
  
  getById: (id: string): Promise<AxiosResponse<ApiResponse<Campaign>>> => 
    api.get(`/campaigns/${id}`),
  
  create: (campaign: Omit<Campaign, 'id'>): Promise<AxiosResponse<ApiResponse<Campaign>>> => 
    api.post('/campaigns', campaign),
  
  update: (id: string, campaign: Partial<Campaign>): Promise<AxiosResponse<ApiResponse<Campaign>>> => 
    api.put(`/campaigns/${id}`, campaign),
  
  delete: (id: string): Promise<AxiosResponse<ApiResponse<void>>> => 
    api.delete(`/campaigns/${id}`),
  
  getPaginated: (page: number, pageSize: number): Promise<AxiosResponse<PaginatedResponse<Campaign>>> => 
    api.get('/campaigns', { params: { page, pageSize } }),
};

// Analytics API endpoints
export const analyticsApi = {
  getDashboardMetrics: (): Promise<AxiosResponse<ApiResponse<DashboardMetrics>>> => 
    api.get('/analytics/dashboard'),
  
  getByDateRange: (startDate: string, endDate: string): Promise<AxiosResponse<ApiResponse<AnalyticsData[]>>> => 
    api.get('/analytics', { params: { startDate, endDate } }),
  
  getCampaignAnalytics: (campaignId: string): Promise<AxiosResponse<ApiResponse<AnalyticsData[]>>> => 
    api.get(`/analytics/campaign/${campaignId}`),
};

export default api;

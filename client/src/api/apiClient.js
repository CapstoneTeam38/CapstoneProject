import axios from 'axios';
import {
  normalizeAnalytics,
  normalizeCases,
  normalizeModelStats,
  normalizePaginatedTransactions,
  normalizePrediction,
  normalizeStats,
} from './normalize';

/**
 * Base Axios instance configured for the frontend
 */
export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Centralized error interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// API Wrappers (returning normalized data)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchStats = async () => {
  const { data } = await apiClient.get('/stats');
  return normalizeStats(data);
};

export const fetchAnalytics = async () => {
  const { data } = await apiClient.get('/analytics');
  return normalizeAnalytics(data);
};

export const fetchModelStats = async () => {
  const { data } = await apiClient.get('/model-stats');
  return normalizeModelStats(data);
};

export const fetchPaginatedTransactions = async ({ page = 1, limit = 100, filter = 'all' } = {}) => {
  const { data } = await apiClient.get('/transactions-page', {
    params: { page, limit, filter },
  });
  return normalizePaginatedTransactions(data);
};

export const fetchCases = async () => {
  const { data } = await apiClient.get('/cases');
  return normalizeCases(data);
};

export const submitCaseReview = async (caseId, reviewPayload) => {
  const { data } = await apiClient.post(`/cases/${caseId}/review`, reviewPayload);
  return data;
};

export const fetchShapExplanation = async (features) => {
  const { data } = await apiClient.post('/shap', features);
  return normalizePrediction(data);
};

export const fetchRecentHistory = async () => {
  const { data } = await apiClient.get('/history');
  return normalizeCases(data);
};

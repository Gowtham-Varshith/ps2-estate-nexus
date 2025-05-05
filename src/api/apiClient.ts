
import { toast } from "sonner";
import { mockData } from "./mockFallback";

/**
 * API Client for PS2 Estate Nexus
 * Handles communication with the Electron backend via IPC
 * Falls back to mock data when running in development or browser environment
 */

// Check if we're running in Electron
const isElectron = () => {
  return window && window.process && window.process.type === 'renderer';
};

// Get the IPC renderer if available
const getIpcRenderer = () => {
  if (isElectron()) {
    return window.require('electron').ipcRenderer;
  }
  return null;
};

// Initialize IPC renderer
const ipcRenderer = getIpcRenderer();

// Base URL for API endpoints (used in browser mode)
const API_BASE_URL = 'http://localhost:3000/api';

// Store auth tokens
let authTokens: { accessToken: string; refreshToken: string } | null = null;

// Constants
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout
const MAX_RETRIES = 3;

/**
 * Execute API request with retry logic
 */
async function executeRequest(
  channel: string,
  method: string,
  endpoint: string,
  data?: any,
  options?: { retry?: boolean; timeout?: number }
): Promise<any> {
  const retry = options?.retry ?? true;
  const timeout = options?.timeout ?? REQUEST_TIMEOUT;
  
  // Function to send request to Electron backend
  const sendElectronRequest = async (retryCount = 0): Promise<any> => {
    try {
      const response = await Promise.race([
        ipcRenderer.invoke('api-request', {
          method,
          endpoint,
          data,
          token: authTokens?.accessToken
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeout))
      ]);
      
      if (response.error) {
        if (response.code === 'UNAUTHORIZED' && authTokens?.refreshToken && retryCount === 0) {
          // Try refreshing the token
          const refreshResult = await ipcRenderer.invoke('api-request', {
            method: 'POST',
            endpoint: '/auth/refresh',
            data: { refreshToken: authTokens.refreshToken }
          });
          
          if (refreshResult.accessToken) {
            authTokens.accessToken = refreshResult.accessToken;
            // Retry with new token
            return sendElectronRequest(retryCount + 1);
          } else {
            // Token refresh failed, need to log in again
            authTokens = null;
            window.localStorage.removeItem('ps2_tokens');
            window.dispatchEvent(new Event('ps2-logout'));
            throw new Error('Authentication expired. Please log in again.');
          }
        } else if (response.code === 'CONNECTION_ERROR' && retry && retryCount < MAX_RETRIES) {
          // Retry connection issues
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          return sendElectronRequest(retryCount + 1);
        }
        throw new Error(response.message || 'An error occurred');
      }
      
      return response;
    } catch (error) {
      if (retry && retryCount < MAX_RETRIES && error.message !== 'Authentication expired. Please log in again.') {
        // Retry on network errors
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return sendElectronRequest(retryCount + 1);
      }
      throw error;
    }
  };
  
  // Function to use mock data
  const useMockData = () => {
    console.log(`[MOCK] ${method} ${endpoint}`);
    
    switch (channel) {
      case 'auth':
        return mockData.auth[endpoint.replace('/auth/', '')](data);
      case 'layouts':
        return mockData.layouts[endpoint.replace('/layouts/', '')](data);
      case 'plots':
        return mockData.plots[endpoint.replace('/plots/', '')](data);
      case 'expenses':
        return mockData.expenses[endpoint.replace('/expenses/', '')](data);
      case 'billings':
        return mockData.billings[endpoint.replace('/billings/', '')](data);
      case 'clients':
        return mockData.clients[endpoint.replace('/clients/', '')](data);
      case 'documents':
        return mockData.documents[endpoint.replace('/documents/', '')](data);
      case 'ai':
        return mockData.ai[endpoint.replace('/ai/', '')](data);
      case 'analytics':
        return mockData.analytics[endpoint.replace('/analytics/', '')](data);
      default:
        console.warn(`Mock data not available for channel: ${channel}`);
        return {};
    }
  };
  
  try {
    if (isElectron() && ipcRenderer) {
      // Use Electron IPC
      return await sendElectronRequest();
    } else {
      // Fall back to mock data in development mode
      return useMockData();
    }
  } catch (error) {
    console.error(`API Error [${channel}:${method} ${endpoint}]:`, error);
    
    // Show error toast
    toast.error(`API Error: ${error.message || 'Something went wrong'}`);
    
    // Attempt to fall back to mock data when API fails
    try {
      return useMockData();
    } catch (fallbackError) {
      throw error; // If mock data fails, throw the original error
    }
  }
}

// Authentication API
export const authApi = {
  login: async (username: string, password: string, role: string) => {
    const response = await executeRequest('auth', 'POST', '/auth/login', { username, password, role });
    if (response.accessToken) {
      authTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      };
      window.localStorage.setItem('ps2_tokens', JSON.stringify(authTokens));
    }
    return response;
  },
  
  logout: async () => {
    const response = await executeRequest('auth', 'POST', '/auth/logout', {});
    authTokens = null;
    window.localStorage.removeItem('ps2_tokens');
    return response;
  },
  
  getCurrentUser: async () => {
    const storedTokens = window.localStorage.getItem('ps2_tokens');
    if (storedTokens) {
      try {
        authTokens = JSON.parse(storedTokens);
        return await executeRequest('auth', 'GET', '/auth/user', {});
      } catch (error) {
        authTokens = null;
        window.localStorage.removeItem('ps2_tokens');
      }
    }
    return null;
  },
  
  refreshToken: async () => {
    if (!authTokens?.refreshToken) return null;
    
    try {
      const response = await executeRequest('auth', 'POST', '/auth/refresh', { 
        refreshToken: authTokens.refreshToken 
      });
      
      if (response.accessToken) {
        authTokens.accessToken = response.accessToken;
        window.localStorage.setItem('ps2_tokens', JSON.stringify(authTokens));
        return response;
      }
      
      return null;
    } catch (error) {
      authTokens = null;
      window.localStorage.removeItem('ps2_tokens');
      return null;
    }
  }
};

// Layouts API
export const layoutsApi = {
  getLayouts: (filters?: any) => 
    executeRequest('layouts', 'GET', '/layouts', filters),
  
  getLayout: (id: number) => 
    executeRequest('layouts', 'GET', `/layouts/${id}`, {}),
  
  createLayout: (layoutData: any) => 
    executeRequest('layouts', 'POST', '/layouts', layoutData),
  
  updateLayout: (id: number, layoutData: any) => 
    executeRequest('layouts', 'PUT', `/layouts/${id}`, layoutData),
  
  deleteLayout: (id: number) => 
    executeRequest('layouts', 'DELETE', `/layouts/${id}`, {}),
  
  getLayoutPlots: (id: number) => 
    executeRequest('layouts', 'GET', `/layouts/${id}/plots`, {}),
  
  getLayoutAnalytics: (id: number) => 
    executeRequest('layouts', 'GET', `/layouts/${id}/analytics`, {})
};

// Plots API
export const plotsApi = {
  getPlots: (filters?: any) => 
    executeRequest('plots', 'GET', '/plots', filters),
  
  getPlot: (id: number) => 
    executeRequest('plots', 'GET', `/plots/${id}`, {}),
  
  createPlot: (plotData: any) => 
    executeRequest('plots', 'POST', '/plots', plotData),
  
  updatePlot: (id: number, plotData: any) => 
    executeRequest('plots', 'PUT', `/plots/${id}`, plotData),
  
  deletePlot: (id: number) => 
    executeRequest('plots', 'DELETE', `/plots/${id}`, {}),
  
  getPlotDocuments: (id: number) => 
    executeRequest('plots', 'GET', `/plots/${id}/documents`, {}),
  
  uploadPlotDocument: (id: number, formData: FormData) => 
    executeRequest('plots', 'POST', `/plots/${id}/documents`, formData),
  
  deletePlotDocument: (plotId: number, documentId: number) => 
    executeRequest('plots', 'DELETE', `/plots/${plotId}/documents/${documentId}`, {})
};

// Expenses API
export const expensesApi = {
  getExpenses: (filters?: any) => 
    executeRequest('expenses', 'GET', '/expenses', filters),
  
  getExpense: (id: number) => 
    executeRequest('expenses', 'GET', `/expenses/${id}`, {}),
  
  createExpense: (expenseData: any) => 
    executeRequest('expenses', 'POST', '/expenses', expenseData),
  
  updateExpense: (id: number, expenseData: any) => 
    executeRequest('expenses', 'PUT', `/expenses/${id}`, expenseData),
  
  deleteExpense: (id: number) => 
    executeRequest('expenses', 'DELETE', `/expenses/${id}`, {}),
  
  getExpenseCategories: () => 
    executeRequest('expenses', 'GET', '/expenses/categories', {})
};

// Billings API
export const billingsApi = {
  getBillings: (filters?: any) => 
    executeRequest('billings', 'GET', '/billings', filters),
  
  getBilling: (id: number) => 
    executeRequest('billings', 'GET', `/billings/${id}`, {}),
  
  createBilling: (billingData: any) => 
    executeRequest('billings', 'POST', '/billings', billingData),
  
  updateBilling: (id: number, billingData: any) => 
    executeRequest('billings', 'PUT', `/billings/${id}`, billingData),
  
  deleteBilling: (id: number) => 
    executeRequest('billings', 'DELETE', `/billings/${id}`, {}),
  
  generatePdf: (id: number) => 
    executeRequest('billings', 'POST', `/billings/${id}/generate-pdf`, {}),
  
  sendEmail: (id: number, emailData: any) => 
    executeRequest('billings', 'POST', `/billings/${id}/send-email`, emailData)
};

// Clients API
export const clientsApi = {
  getClients: (filters?: any) => 
    executeRequest('clients', 'GET', '/clients', filters),
  
  getClient: (id: number) => 
    executeRequest('clients', 'GET', `/clients/${id}`, {}),
  
  createClient: (clientData: any) => 
    executeRequest('clients', 'POST', '/clients', clientData),
  
  updateClient: (id: number, clientData: any) => 
    executeRequest('clients', 'PUT', `/clients/${id}`, clientData),
  
  deleteClient: (id: number) => 
    executeRequest('clients', 'DELETE', `/clients/${id}`, {}),
  
  getClientInteractions: (id: number) => 
    executeRequest('clients', 'GET', `/clients/${id}/interactions`, {})
};

// Documents API
export const documentsApi = {
  getDocuments: (filters?: any) => 
    executeRequest('documents', 'GET', '/documents', filters),
  
  getDocument: (id: number) => 
    executeRequest('documents', 'GET', `/documents/${id}`, {}),
  
  uploadDocument: (documentData: FormData) => 
    executeRequest('documents', 'POST', '/documents', documentData),
  
  deleteDocument: (id: number) => 
    executeRequest('documents', 'DELETE', `/documents/${id}`, {}),
  
  searchDocuments: (query: string) => 
    executeRequest('documents', 'GET', '/documents/search', { query })
};

// Analytics & Reporting API
export const analyticsApi = {
  getDashboardData: () => 
    executeRequest('analytics', 'GET', '/analytics/dashboard', {}),
  
  getSalesPerformance: (filters?: any) => 
    executeRequest('analytics', 'GET', '/analytics/sales', filters),
  
  getPlotsAnalytics: (filters?: any) => 
    executeRequest('analytics', 'GET', '/analytics/plots', filters),
  
  getLayoutsAnalytics: (filters?: any) => 
    executeRequest('analytics', 'GET', '/analytics/layouts', filters),
  
  generateReport: (reportParams: any) => 
    executeRequest('analytics', 'GET', '/reports/generate', reportParams)
};

// Notifications API
export const notificationsApi = {
  getNotifications: () => 
    executeRequest('notifications', 'GET', '/notifications', {}),
  
  markAsRead: (id: number) => 
    executeRequest('notifications', 'PUT', `/notifications/${id}`, {}),
  
  deleteNotification: (id: number) => 
    executeRequest('notifications', 'DELETE', `/notifications/${id}`, {})
};

// AI Features API
export const aiApi = {
  search: (query: string, filters?: any) => 
    executeRequest('ai', 'POST', '/ai/search', { query, filters }),
  
  generateBrochure: (plotId: number, options: any) => 
    executeRequest('ai', 'POST', '/ai/generate-brochure', { plotId, ...options }),
  
  generateWhatsappTemplate: (data: any) => 
    executeRequest('ai', 'POST', '/ai/whatsapp-template', data)
};

// Settings & System API
export const settingsApi = {
  getSettings: () => 
    executeRequest('settings', 'GET', '/settings', {}),
  
  updateSettings: (settingsData: any) => 
    executeRequest('settings', 'PUT', '/settings', settingsData),
  
  createBackup: () => 
    executeRequest('backup', 'POST', '/backup', {}),
  
  getBackups: () => 
    executeRequest('backup', 'GET', '/backup', {}),
  
  downloadBackup: (id: number) => 
    executeRequest('backup', 'GET', `/backup/${id}`, {}),
  
  getLogs: (filters?: any) => 
    executeRequest('logs', 'GET', '/logs', filters)
};

// Export all API endpoints
export const api = {
  auth: authApi,
  layouts: layoutsApi,
  plots: plotsApi,
  expenses: expensesApi,
  billings: billingsApi,
  clients: clientsApi,
  documents: documentsApi,
  analytics: analyticsApi,
  notifications: notificationsApi,
  ai: aiApi,
  settings: settingsApi
};

export default api;

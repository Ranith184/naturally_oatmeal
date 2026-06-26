const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
  : window.location.origin;

// Helper to make API requests with optional authentication
async function apiRequest(endpoint, method = 'GET', body = null, requireAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = localStorage.getItem('theoh_admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Public route
  submitOrder: async (orderData) => {
    return apiRequest('/orders', 'POST', orderData);
  },

  // Auth route
  adminLogin: async (password) => {
    const data = await apiRequest('/auth/login', 'POST', { password });
    if (data.token) {
      localStorage.setItem('theoh_admin_token', data.token);
    }
    return data;
  },

  // Protected routes
  fetchOrders: async () => {
    return apiRequest('/orders', 'GET', null, true);
  },

  updateOrderStatus: async (id, status) => {
    return apiRequest(`/orders/${id}/status`, 'PATCH', { status }, true);
  },

  fetchStats: async () => {
    return apiRequest('/orders/stats', 'GET', null, true);
  },

  clearOrders: async () => {
    return apiRequest('/orders', 'DELETE', null, true);
  },

  // Menu routes
  fetchMenu: async () => {
    return apiRequest('/menu', 'GET');
  },

  createMenuItem: async (itemData) => {
    return apiRequest('/menu/items', 'POST', itemData, true);
  },

  updateMenuItem: async (id, itemData) => {
    return apiRequest(`/menu/items/${id}`, 'PUT', itemData, true);
  },

  deleteMenuItem: async (id) => {
    return apiRequest(`/menu/items/${id}`, 'DELETE', null, true);
  },

  logout: () => {
    localStorage.removeItem('theoh_admin_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('theoh_admin_token');
  }
};

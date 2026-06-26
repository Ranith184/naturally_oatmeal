import { oatsBreads, ADDONS, COMBOS } from '../data';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
  : window.location.origin;

// Initialize local storage databases if not already present
const getLocalOrders = () => {
  const data = localStorage.getItem('theoh_local_orders');
  return data ? JSON.parse(data) : [];
};

const saveLocalOrders = (orders) => {
  localStorage.setItem('theoh_local_orders', JSON.stringify(orders));
};

const getLocalMenu = () => {
  const data = localStorage.getItem('theoh_local_menu');
  if (data) return JSON.parse(data);
  
  // Reconstruct menu structure from static fallbacks
  const flatAddons = [];
  Object.entries(ADDONS).forEach(([category, items]) => {
    items.forEach(item => {
      flatAddons.push({ ...item, category });
    });
  });
  
  const initialMenu = {
    bases: oatsBreads,
    addons: flatAddons,
    combos: COMBOS
  };
  localStorage.setItem('theoh_local_menu', JSON.stringify(initialMenu));
  return initialMenu;
};

const saveLocalMenu = (menu) => {
  localStorage.setItem('theoh_local_menu', JSON.stringify(menu));
};

// Fallback logic simulating Express backend when API is not available
function handleFallback(endpoint, method, body, requireAuth) {
  const safeBody = body || {};

  // 1. Auth Endpoint
  if (endpoint === '/auth/login' && method === 'POST') {
    const { password } = safeBody;
    if (password === 'admin123') {
      return { token: 'mock_jwt_token_for_vercel' };
    } else {
      throw new Error('Incorrect password');
    }
  }

  // 2. Orders POST (Create Order)
  if (endpoint === '/orders' && method === 'POST') {
    const orders = getLocalOrders();
    let nextNumber = 1001;
    if (orders.length > 0) {
      const numbers = orders.map(o => {
        const match = o.id.match(/TH-(\d+)/);
        return match ? parseInt(match[1], 10) : 1000;
      });
      nextNumber = Math.max(...numbers) + 1;
    }
    const newOrder = {
      id: `TH-${nextNumber}`,
      items: safeBody.items,
      customer: safeBody.customer,
      totalPrice: safeBody.totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    saveLocalOrders(orders);
    return newOrder;
  }

  // 3. Orders GET (Fetch Orders)
  if (endpoint === '/orders' && method === 'GET') {
    return getLocalOrders();
  }

  // 4. Orders DELETE (Clear All Orders)
  if (endpoint === '/orders' && method === 'DELETE') {
    saveLocalOrders([]);
    return { message: 'All orders cleared successfully' };
  }

  // 5. Update Order Status
  if (endpoint.startsWith('/orders/') && endpoint.endsWith('/status') && method === 'PATCH') {
    const parts = endpoint.split('/');
    const orderId = parts[2];
    const { status } = safeBody;
    const orders = getLocalOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) {
      throw new Error('Order not found');
    }
    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();
    saveLocalOrders(orders);
    return orders[index];
  }

  // 6. Orders stats (Analytics)
  if (endpoint === '/orders/stats' && method === 'GET') {
    const orders = getLocalOrders();
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const canceledOrders = orders.filter(o => o.status === 'canceled').length;
    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'canceled').length;
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalPrice, 0);
    const averageOrderValue = completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0;

    const slotBreakdown = {};
    const popularBases = {};
    const popularAddons = {};

    orders.forEach(order => {
      if (order.status !== 'canceled') {
        const slot = order.customer.timeSlot || 'Unknown';
        slotBreakdown[slot] = (slotBreakdown[slot] || 0) + 1;
        order.items.forEach(item => {
          if (item.base) {
            const baseName = item.base.name;
            popularBases[baseName] = (popularBases[baseName] || 0) + item.qty;
          }
          if (item.addons && Array.isArray(item.addons)) {
            item.addons.forEach(addon => {
              const addonName = addon.name;
              popularAddons[addonName] = (popularAddons[addonName] || 0) + item.qty;
            });
          }
        });
      }
    });

    return {
      summary: {
        totalRevenue,
        totalOrders,
        completedOrders,
        activeOrders,
        canceledOrders,
        averageOrderValue
      },
      slotBreakdown,
      popularBases,
      popularAddons
    };
  }

  // 7. Menu GET
  if (endpoint === '/menu' && method === 'GET') {
    return getLocalMenu();
  }

  // 8. Menu Item POST (Add Menu Item)
  if (endpoint === '/menu/items' && method === 'POST') {
    const menu = getLocalMenu();
    const { type, name, price, tags, desc, image, category } = safeBody;
    const inStock = safeBody.inStock !== false;
    let newItem = {};

    if (type === 'base') {
      let nextNum = 1;
      if (menu.bases && menu.bases.length > 0) {
        const nums = menu.bases.map(b => {
          const match = b.id.match(/^b(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        });
        nextNum = Math.max(...nums, 0) + 1;
      }
      newItem = { id: `b${nextNum}`, name, price, tags: tags || [], desc: desc || '', image: image || '', inStock };
      menu.bases.push(newItem);
    } else if (type === 'addon') {
      let prefix = 'addon';
      if (category === 'Spreads & Sweeteners') prefix = 'bu';
      else if (category === 'Fresh Fruits') prefix = 'f';
      else if (category === 'Premium Nuts') prefix = 'n';
      else if (category === 'Healthy Seeds') prefix = 's';

      let nextNum = 1;
      if (menu.addons && menu.addons.length > 0) {
        const nums = menu.addons
          .filter(a => a.id.startsWith(prefix))
          .map(a => {
            const match = a.id.substring(prefix.length).match(/^(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
          });
        nextNum = Math.max(...nums, 0) + 1;
      }
      newItem = { id: `${prefix}${nextNum}`, name, price, tags: tags || [], image: image || '', category, inStock };
      menu.addons.push(newItem);
    } else if (type === 'combo') {
      let nextNum = 1;
      if (menu.combos && menu.combos.length > 0) {
        const nums = menu.combos.map(c => {
          const match = c.id.match(/^c(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        });
        nextNum = Math.max(...nums, 0) + 1;
      }
      newItem = { id: `c${nextNum}`, name, base: safeBody.base || '', addons: safeBody.addons || [], price, tag: safeBody.tag || '', image: safeBody.image || '', inStock };
      menu.combos.push(newItem);
    } else {
      throw new Error('Invalid item type');
    }

    saveLocalMenu(menu);
    return newItem;
  }

  // 9. Menu Item PUT (Update Menu Item)
  if (endpoint.startsWith('/menu/items/') && method === 'PUT') {
    const parts = endpoint.split('/');
    const itemId = parts[3];
    const menu = getLocalMenu();

    const baseIndex = menu.bases.findIndex(b => b.id === itemId);
    if (baseIndex !== -1) {
      const updated = { ...menu.bases[baseIndex], ...safeBody };
      menu.bases[baseIndex] = updated;
      saveLocalMenu(menu);
      return updated;
    }

    const addonIndex = menu.addons.findIndex(a => a.id === itemId);
    if (addonIndex !== -1) {
      const updated = { ...menu.addons[addonIndex], ...safeBody };
      menu.addons[addonIndex] = updated;
      saveLocalMenu(menu);
      return updated;
    }

    const comboIndex = menu.combos.findIndex(c => c.id === itemId);
    if (comboIndex !== -1) {
      const updated = { ...menu.combos[comboIndex], ...safeBody };
      menu.combos[comboIndex] = updated;
      saveLocalMenu(menu);
      return updated;
    }

    throw new Error('Menu item not found');
  }

  // 10. Menu Item DELETE (Delete Menu Item)
  if (endpoint.startsWith('/menu/items/') && method === 'DELETE') {
    const parts = endpoint.split('/');
    const itemId = parts[3];
    const menu = getLocalMenu();

    const baseIndex = menu.bases.findIndex(b => b.id === itemId);
    if (baseIndex !== -1) {
      menu.bases.splice(baseIndex, 1);
      saveLocalMenu(menu);
      return { message: 'Menu item deleted successfully' };
    }

    const addonIndex = menu.addons.findIndex(a => a.id === itemId);
    if (addonIndex !== -1) {
      menu.addons.splice(addonIndex, 1);
      saveLocalMenu(menu);
      return { message: 'Menu item deleted successfully' };
    }

    const comboIndex = menu.combos.findIndex(c => c.id === itemId);
    if (comboIndex !== -1) {
      menu.combos.splice(comboIndex, 1);
      saveLocalMenu(menu);
      return { message: 'Menu item deleted successfully' };
    }

    throw new Error('Menu item not found');
  }

  throw new Error(`Fallback simulation not implemented for ${method} ${endpoint}`);
}

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
    console.warn(`API Request failed for [${method} ${endpoint}]. Falling back to client-side database simulation.`, error);
    return handleFallback(endpoint, method, body, requireAuth);
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

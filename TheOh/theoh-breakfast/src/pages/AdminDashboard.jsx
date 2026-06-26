import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Users, TrendingUp, Calendar, Clock, 
  Search, Filter, CheckCircle2, Truck, AlertCircle, XOctagon,
  LogOut, RefreshCw, MessageCircle, Phone, ArrowUpRight,
  Plus, Edit2, Trash2, Check, X, Layers, Image, Sparkles,
  Bell, BellOff
} from 'lucide-react';
import { api, SOCKET_URL } from '../services/api';
import { formatINR } from '../utils/currency';
import io from 'socket.io-client';

// Synthesise audio chime using Web Audio API (cross-browser, no asset load overhead)
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Tone 1: High crisp ding (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);
    
    // Tone 2: Clean harmonic resonance (A5) after 120ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.75);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.75);
  } catch (e) {
    console.warn("Web Audio chime play blocked or unsupported:", e);
  }
};

export function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'analytics', 'menu'
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  
  // Real-time floating alerts state
  const [alerts, setAlerts] = useState([]);

  // Orders Tab filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Menu Manager states
  const [menuBases, setMenuBases] = useState([]);
  const [menuAddons, setMenuAddons] = useState([]);
  const [menuCombos, setMenuCombos] = useState([]);
  const [menuLoadingState, setMenuLoadingState] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuSubTab, setMenuSubTab] = useState('bases'); // 'bases', 'addons', or 'combos'
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const initialFormData = {
    type: 'base',
    category: 'Spreads & Sweeteners',
    name: '',
    price: '',
    image: '',
    tags: '',
    desc: '',
    inStock: true
  };
  const [menuFormData, setMenuFormData] = useState(initialFormData);

  // Desktop notifications permission state
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedOrders = await api.fetchOrders();
      setOrders(fetchedOrders);
      
      const fetchedStats = await api.fetchStats();
      setStats(fetchedStats);

      await loadMenu();
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('expired') || err.message.includes('token')) {
        api.logout();
        onLogout();
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMenu = async () => {
    setMenuLoadingState(true);
    try {
      const menuData = await api.fetchMenu();
      setMenuBases(menuData.bases || []);
      setMenuAddons(menuData.addons || []);
      setMenuCombos(menuData.combos || []);
    } catch (err) {
      console.error('Failed to load menu in admin dashboard:', err);
    } finally {
      setMenuLoadingState(false);
    }
  };

  // Connect to WebSockets on mount
  useEffect(() => {
    fetchData();

    // Establish WebSocket Connection
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('[WS] Connected to Server successfully');
    });

    // Listen for new orders
    socket.on('new_order', (newOrder) => {
      // Play Audio Notification Chime
      playNotificationSound();

      // Spawn native OS desktop notification if permission is granted
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          const desktopAlert = new Notification(`New Order: ${newOrder.id}`, {
            body: `${newOrder.customer.name} - ${formatINR(newOrder.totalPrice)}\nSlot: ${newOrder.customer.timeSlot}`,
            tag: newOrder.id,
            requireInteraction: true // keep notification active until user clicks/dismisses
          });
          desktopAlert.onclick = () => {
            window.focus();
            desktopAlert.close();
          };
        } catch (e) {
          console.warn("Failed to trigger browser desktop notification:", e);
        }
      }

      // Spawn floating Alert
      const alertId = `${Date.now()}-${Math.random()}`;
      setAlerts(prev => [{ id: alertId, order: newOrder }, ...prev]);

      // Prepend to orders list instantly
      setOrders(prev => {
        if (prev.some(o => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });

      // Update local quick stats widgets
      setStats(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          summary: {
            ...prev.summary,
            activeOrders: prev.summary.activeOrders + 1,
            totalOrders: prev.summary.totalOrders + 1
          }
        };
      });

      // Auto-dismiss alert banner after 10 seconds
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
      }, 10000);
    });

    socket.on('order_status_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o));
      // Refresh analytics statistics quietly
      api.fetchStats().then(s => setStats(s)).catch(console.error);
    });

    socket.on('menu_updated', () => {
      loadMenu();
    });

    socket.on('orders_cleared', () => {
      setOrders([]);
      api.fetchStats().then(s => setStats(s)).catch(console.error);
    });

    const handleStorageChange = (e) => {
      if (e.key === 'theoh_local_orders') {
        api.fetchOrders().then(fetchedOrders => {
          setOrders(fetchedOrders);
          api.fetchStats().then(s => setStats(s)).catch(console.error);
        }).catch(console.error);
      }
      if (e.key === 'theoh_local_menu') {
        loadMenu();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      socket.disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      const fetchedStats = await api.fetchStats();
      setStats(fetchedStats);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Toggle inStock status via API instantly
  const handleToggleStock = async (item) => {
    try {
      const nextStock = !item.inStock;
      
      // Update locally for visual responsiveness
      if (menuBases.some(b => b.id === item.id)) {
        setMenuBases(prev => prev.map(b => b.id === item.id ? { ...b, inStock: nextStock } : b));
      } else if (menuAddons.some(a => a.id === item.id)) {
        setMenuAddons(prev => prev.map(a => a.id === item.id ? { ...a, inStock: nextStock } : a));
      } else {
        setMenuCombos(prev => prev.map(c => c.id === item.id ? { ...c, inStock: nextStock } : c));
      }

      await api.updateMenuItem(item.id, { inStock: nextStock });
    } catch (err) {
      alert('Failed to toggle stock status: ' + err.message);
      loadMenu(); // revert
    }
  };

  // Delete menu item
  const handleDeleteMenuItem = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this item from the menu?')) return;
    try {
      await api.deleteMenuItem(id);
      await loadMenu();
    } catch (err) {
      alert('Failed to delete menu item: ' + err.message);
    }
  };

  // Clear all orders from the database
  const handleClearAllOrders = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all orders from the database? This action cannot be undone.')) return;
    try {
      await api.clearOrders();
      setOrders([]);
      const fetchedStats = await api.fetchStats();
      setStats(fetchedStats);
    } catch (err) {
      alert('Failed to clear orders: ' + err.message);
    }
  };

  // Open modal in Create mode
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setMenuFormData({
      type: menuSubTab === 'combos' ? 'combo' : (menuSubTab === 'addons' ? 'addon' : 'base'),
      category: 'Spreads & Sweeteners',
      name: '',
      price: '',
      image: '',
      tags: '',
      desc: '',
      inStock: true,
      tag: '',
      base: '',
      addons: []
    });
    setShowMenuModal(true);
  };

  // Open modal in Edit mode
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const isBase = menuBases.some(b => b.id === item.id);
    const isAddon = menuAddons.some(a => a.id === item.id);
    setMenuFormData({
      type: isBase ? 'base' : (isAddon ? 'addon' : 'combo'),
      category: item.category || 'Spreads & Sweeteners',
      name: item.name || '',
      price: item.price || '',
      image: item.image || '',
      tags: item.tags ? item.tags.join(', ') : '',
      desc: item.desc || '',
      inStock: item.inStock !== false,
      tag: item.tag || '',
      base: item.base || '',
      addons: item.addons || []
    });
    setShowMenuModal(true);
  };

  // Handle Form submission
  const handleMenuFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedPrice = parseFloat(menuFormData.price);
      if (isNaN(formattedPrice)) {
        alert('Please enter a valid price.');
        return;
      }

      const tagArray = menuFormData.tags
        ? menuFormData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const payload = {
        name: menuFormData.name,
        price: formattedPrice,
        image: menuFormData.image,
        tags: tagArray,
        desc: menuFormData.desc,
        category: menuFormData.category,
        inStock: menuFormData.inStock,
        type: menuFormData.type,
        tag: menuFormData.tag || '',
        base: menuFormData.base || '',
        addons: menuFormData.addons || []
      };

      if (editingItem) {
        await api.updateMenuItem(editingItem.id, payload);
      } else {
        await api.createMenuItem(payload);
      }

      setShowMenuModal(false);
      await loadMenu();
    } catch (err) {
      alert('Failed to save menu item: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'preparing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'out_for_delivery':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'canceled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = 
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filter menu lists based on menu search query
  const filteredMenuBases = menuBases.filter(b => 
    b.name.toLowerCase().includes(menuSearchQuery.toLowerCase())
  );
  const filteredMenuAddons = menuAddons.filter(a => 
    a.name.toLowerCase().includes(menuSearchQuery.toLowerCase())
  );
  const filteredMenuCombos = menuCombos.filter(c => 
    c.name.toLowerCase().includes(menuSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-theoh-beige/40 pb-16 font-sans relative">
      
      {/* Top Navbar */}
      <nav className="bg-white border-b border-theoh-border/40 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-[#004700] text-white p-2 rounded-2xl">
                <ShoppingBag size={20} />
              </div>
              <div>
                <span className="font-black text-theoh-brown text-lg uppercase tracking-wide">Naturally Eat & Fit</span>
                <span className="text-xs bg-[#E8F5E9] text-[#004700] ml-2 px-2.5 py-0.5 rounded-full font-black uppercase">Admin Panel</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Desktop Alerts status button */}
              {('Notification' in window) && (
                <button
                  onClick={requestNotificationPermission}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs border transition-all ${
                    notificationPermission === 'granted'
                      ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#004700]'
                      : notificationPermission === 'denied'
                      ? 'bg-red-50 border-red-200 text-red-600 cursor-not-allowed'
                      : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 animate-pulse'
                  }`}
                  disabled={notificationPermission === 'denied'}
                  title={
                    notificationPermission === 'granted'
                      ? 'Desktop Alerts Enabled'
                      : notificationPermission === 'denied'
                      ? 'Desktop Alerts Blocked (check browser settings)'
                      : 'Click to enable Desktop Alerts'
                  }
                >
                  {notificationPermission === 'granted' ? <Bell size={13} /> : <BellOff size={13} />}
                  <span>
                    {notificationPermission === 'granted'
                      ? 'Alerts Active'
                      : notificationPermission === 'denied'
                      ? 'Alerts Blocked'
                      : 'Enable Alerts'}
                  </span>
                </button>
              )}

              <button 
                onClick={fetchData}
                className="p-2 rounded-xl text-theoh-muted hover:bg-theoh-beige/50 transition-colors"
                title="Refresh Data"
              >
                <RefreshCw size={18} className={loading ? "animate-spin text-[#004700]" : ""} />
              </button>
              
              <button
                onClick={() => {
                  api.logout();
                  onLogout();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs transition-colors"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Quick Summary Widgets */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white p-6 rounded-3xl border border-theoh-border/40 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-theoh-muted uppercase tracking-wider">Completed Revenue</p>
                <h3 className="text-2xl font-black text-[#004700] mt-1">{formatINR(stats.summary.totalRevenue)}</h3>
              </div>
              <div className="bg-[#E8F5E9] text-[#004700] p-3 rounded-2xl">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-theoh-border/40 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-theoh-muted uppercase tracking-wider">Active Orders</p>
                <h3 className="text-2xl font-black text-theoh-brown mt-1">{stats.summary.activeOrders}</h3>
              </div>
              <div className="bg-blue-50 text-blue-700 p-3 rounded-2xl">
                <Truck size={20} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-theoh-border/40 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-theoh-muted uppercase tracking-wider">Total Orders</p>
                <h3 className="text-2xl font-black text-theoh-brown mt-1">{stats.summary.totalOrders}</h3>
              </div>
              <div className="bg-amber-50 text-amber-700 p-3 rounded-2xl">
                <ShoppingBag size={20} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-theoh-border/40 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-theoh-muted uppercase tracking-wider">Average Order Value</p>
                <h3 className="text-2xl font-black text-theoh-brown mt-1">{formatINR(stats.summary.averageOrderValue)}</h3>
              </div>
              <div className="bg-indigo-50 text-indigo-700 p-3 rounded-2xl">
                <ArrowUpRight size={20} />
              </div>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-theoh-border/50 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-6 font-bold text-sm tracking-wide border-b-2 transition-all uppercase shrink-0 ${
              activeTab === 'orders' 
                ? 'border-[#004700] text-[#004700]' 
                : 'border-transparent text-theoh-muted hover:text-theoh-brown'
            }`}
          >
            Orders Manager ({filteredOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-6 font-bold text-sm tracking-wide border-b-2 transition-all uppercase shrink-0 ${
              activeTab === 'analytics' 
                ? 'border-[#004700] text-[#004700]' 
                : 'border-transparent text-theoh-muted hover:text-theoh-brown'
            }`}
          >
            Insights & Prep Analytics
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-3 px-6 font-bold text-sm tracking-wide border-b-2 transition-all uppercase shrink-0 ${
              activeTab === 'menu' 
                ? 'border-[#004700] text-[#004700]' 
                : 'border-transparent text-theoh-muted hover:text-theoh-brown'
            }`}
          >
            Menu Manager
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold p-4 rounded-2xl flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <RefreshCw size={36} className="animate-spin text-[#004700] mb-4" />
            <p className="text-sm font-bold text-theoh-muted">Fetching latest database records...</p>
          </div>
        ) : (
          <>
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                
                {/* Search and Filter Panel */}
                <div className="bg-white p-4 rounded-3xl border border-theoh-border/40 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                  
                  {/* Search */}
                  <div className="relative w-full md:max-w-xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theoh-muted">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search Order ID, Name, Phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-theoh-border bg-white text-sm outline-none focus:border-[#004700] focus:ring-1 focus:ring-[#E8F5E9]"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <span className="text-xs font-bold text-theoh-muted flex items-center gap-1 mr-1 uppercase">
                      <Filter size={12} />
                      Filter Status:
                    </span>
                    {['all', 'pending', 'preparing', 'out_for_delivery', 'delivered', 'canceled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border capitalize transition-all ${
                          statusFilter === status 
                            ? 'bg-[#004700] border-[#004700] text-white shadow-sm' 
                            : 'bg-white border-theoh-border text-theoh-brown hover:border-theoh-orange/30'
                        }`}
                      >
                        {status.replace(/_/g, ' ')}
                      </button>
                    ))}

                    {/* Clear All Orders Button */}
                    <button
                      onClick={handleClearAllOrders}
                      className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ml-auto sm:ml-4"
                      title="Clear all orders from database"
                    >
                      <Trash2 size={13} />
                      <span>Clear All</span>
                    </button>
                  </div>

                </div>

                {/* Orders List Grid */}
                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 border border-theoh-border/40 text-center">
                    <ShoppingBag className="mx-auto text-theoh-muted mb-4" size={40} />
                    <h4 className="font-black text-lg text-theoh-brown">No orders found</h4>
                    <p className="text-sm text-theoh-muted mt-1">Try adjusting your filters or search terms.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredOrders.map((order) => (
                      <div 
                        key={order.id}
                        className={`bg-white rounded-3xl border shadow-sm p-6 flex flex-col justify-between transition-all hover:shadow-md ${
                          order.status === 'pending' ? 'border-l-4 border-l-amber-500 border-theoh-border/50' : 'border-theoh-border/50'
                        }`}
                      >
                        <div>
                          {/* Order Header */}
                          <div className="flex justify-between items-start gap-2 border-b border-theoh-border/20 pb-4 mb-4">
                            <div>
                              <span className="text-xs font-bold text-theoh-muted uppercase tracking-wider">Order</span>
                              <h4 className="font-black text-theoh-brown text-lg">{order.id}</h4>
                              <p className="text-[11px] font-semibold text-theoh-muted mt-0.5">
                                {new Date(order.createdAt).toLocaleString('en-IN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              {/* Status Pill */}
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(order.status)}`}>
                                {getStatusLabel(order.status)}
                              </span>

                              {/* Quick Status Updater */}
                              <select
                                value={order.status}
                                disabled={updatingId === order.id}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className="text-xs font-bold bg-theoh-beige border border-theoh-border text-theoh-brown px-2.5 py-1.5 rounded-xl outline-none focus:border-[#004700] disabled:opacity-50"
                              >
                                <option value="pending">Set Pending</option>
                                <option value="preparing">Set Preparing</option>
                                <option value="out_for_delivery">Set Out for Delivery</option>
                                <option value="delivered">Set Delivered</option>
                                <option value="canceled">Set Canceled</option>
                              </select>
                            </div>
                          </div>

                          {/* Customer Information */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-theoh-beige/25 p-4 rounded-2xl border border-theoh-border/30 text-xs">
                            <div className="space-y-1.5">
                              <p className="font-bold text-theoh-muted uppercase tracking-wider text-[10px]">Customer Details</p>
                              <p className="font-black text-theoh-brown text-sm">{order.customer.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <a 
                                  href={`tel:${order.customer.phone}`}
                                  className="flex items-center gap-1 font-bold text-blue-600 hover:underline"
                                >
                                  <Phone size={11} />
                                  <span>{order.customer.phone}</span>
                                </a>
                                <a 
                                  href={`https://wa.me/${order.customer.phone}`}
                                  target="_blank"
                                  className="flex items-center gap-1 font-bold text-green-600 hover:underline"
                                >
                                  <MessageCircle size={11} />
                                  <span>WhatsApp</span>
                                </a>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <p className="font-bold text-theoh-muted uppercase tracking-wider text-[10px]">Preferred Time & Location</p>
                              <p className="font-bold text-theoh-brown flex items-center gap-1">
                                <Clock size={11} className="text-theoh-orange" />
                                <span>{order.customer.timeSlot}</span>
                              </p>
                              <p className="text-theoh-muted leading-relaxed font-medium mt-0.5">{order.customer.address}</p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="space-y-3 mb-4">
                            <p className="text-[10px] font-bold text-theoh-muted uppercase tracking-wider">Ordered Items</p>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-xl border border-theoh-border/30 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-theoh-brown">
                                    {item.base?.name || 'Custom Base'} <span className="text-[#004700] text-xs">x{item.qty}</span>
                                  </span>
                                  <span className="font-black text-theoh-brown">
                                    {formatINR(((item.base?.price || 0) + (item.addons ? item.addons.reduce((s, a) => s + a.price, 0) : 0)) * item.qty)}
                                  </span>
                                </div>
                                {item.addons && item.addons.length > 0 ? (
                                  <p className="text-xs text-theoh-muted mt-1 leading-relaxed pl-1 border-l-2 border-l-theoh-border">
                                    + {item.addons.map(a => a.name).join(', ')}
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-theoh-muted italic mt-0.5 pl-1 border-l-2 border-l-theoh-border/40">
                                    No toppings
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Notes */}
                          {order.customer.notes && (
                            <div className="bg-amber-50/70 border border-amber-100 p-3.5 rounded-2xl mb-4 text-xs">
                              <span className="font-bold text-amber-800 block uppercase tracking-wider text-[10px] mb-1">Kitchen / Delivery Note:</span>
                              <p className="text-amber-700 italic">"{order.customer.notes}"</p>
                            </div>
                          )}
                        </div>

                        {/* Order Total Price */}
                        <div className="flex justify-between items-center border-t border-theoh-border/20 pt-4 mt-2">
                          <span className="font-black text-sm text-theoh-brown">Total Charged:</span>
                          <span className="font-black text-[#004700] text-xl">{formatINR(order.totalPrice)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && stats && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Column 1: Time Slot Demands */}
                <div className="bg-white p-6 rounded-[32px] border border-theoh-border/40 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 text-[#004700] mb-2 border-b border-theoh-border/25 pb-3">
                    <Calendar size={18} />
                    <h4 className="font-black text-base text-theoh-brown uppercase">Delivery Slot Demands</h4>
                  </div>

                  {Object.keys(stats.slotBreakdown).length === 0 ? (
                    <p className="text-sm text-theoh-muted text-center py-8">No slot data available yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(stats.slotBreakdown)
                        .sort((a, b) => b[1] - a[1])
                        .map(([slot, count]) => {
                          const maxCount = Math.max(...Object.values(stats.slotBreakdown));
                          const percent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                          return (
                            <div key={slot} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold text-theoh-brown">
                                <span className="flex items-center gap-1.5">
                                  <Clock size={12} className="text-theoh-orange" />
                                  {slot}
                                </span>
                                <span>{count} {count === 1 ? 'order' : 'orders'}</span>
                              </div>
                              <div className="w-full bg-theoh-beige/50 h-3 rounded-full overflow-hidden border border-theoh-border/20">
                                <div 
                                  className="bg-theoh-orange h-full rounded-full" 
                                  style={{ width: `${percent}%` }}
                               />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Column 2: Popular Base Bowls */}
                <div className="bg-white p-6 rounded-[32px] border border-theoh-border/40 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 text-[#004700] mb-2 border-b border-theoh-border/25 pb-3">
                    <ShoppingBag size={18} />
                    <h4 className="font-black text-base text-theoh-brown uppercase">Top Selling Base Bowls</h4>
                  </div>

                  {Object.keys(stats.popularBases).length === 0 ? (
                    <p className="text-sm text-theoh-muted text-center py-8">No item sales data yet.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {Object.entries(stats.popularBases)
                        .sort((a, b) => b[1] - a[1])
                        .map(([base, qty], idx) => (
                          <div key={base} className="flex justify-between items-center text-xs font-bold py-2 border-b border-theoh-border/10 last:border-0">
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-lg bg-theoh-beige flex items-center justify-center text-[10px] text-[#004700] font-black">
                                #{idx + 1}
                              </span>
                              <span className="text-theoh-brown font-black">{base}</span>
                            </span>
                            <span className="bg-[#E8F5E9] text-[#004700] px-2.5 py-1 rounded-full text-[10px]">
                              {qty} sold
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Column 3: Popular Toppings */}
                <div className="bg-white p-6 rounded-[32px] border border-theoh-border/40 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 text-[#004700] mb-2 border-b border-theoh-border/25 pb-3">
                    <TrendingUp size={18} />
                    <h4 className="font-black text-base text-theoh-brown uppercase">Top Requested Toppings</h4>
                  </div>

                  {Object.keys(stats.popularAddons).length === 0 ? (
                    <p className="text-sm text-theoh-muted text-center py-8">No topping sales data yet.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {Object.entries(stats.popularAddons)
                        .sort((a, b) => b[1] - a[1])
                        .map(([addon, qty], idx) => (
                          <div key={addon} className="flex justify-between items-center text-xs font-bold py-2 border-b border-theoh-border/10 last:border-0">
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-lg bg-theoh-beige flex items-center justify-center text-[10px] text-theoh-orange font-black">
                                #{idx + 1}
                              </span>
                              <span className="text-theoh-brown font-black">{addon}</span>
                            </span>
                            <span className="bg-theoh-lightOrange text-theoh-orange px-2.5 py-1 rounded-full text-[10px]">
                              {qty} selected
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Menu Manager Tab */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                
                {/* Menu Action bar */}
                <div className="bg-white p-4 rounded-3xl border border-theoh-border/40 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                  {/* Search Input */}
                  <div className="relative w-full sm:max-w-xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theoh-muted">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={menuSearchQuery}
                      onChange={(e) => setMenuSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-theoh-border bg-white text-sm outline-none focus:border-[#004700] focus:ring-1 focus:ring-[#E8F5E9] font-medium"
                    />
                  </div>

                  {/* Sub-tab selection bases vs addons */}
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setMenuSubTab('bases')}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        menuSubTab === 'bases'
                          ? 'bg-[#004700] border-[#004700] text-white'
                          : 'bg-white border-theoh-border text-theoh-brown hover:border-theoh-orange/30'
                      }`}
                    >
                      Base Bowls & Breads ({filteredMenuBases.length})
                    </button>
                    <button
                      onClick={() => setMenuSubTab('addons')}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        menuSubTab === 'addons'
                          ? 'bg-[#004700] border-[#004700] text-white'
                          : 'bg-white border-theoh-border text-theoh-brown hover:border-theoh-orange/30'
                      }`}
                    >
                      Addons & Toppings ({filteredMenuAddons.length})
                    </button>
                    <button
                      onClick={() => setMenuSubTab('combos')}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        menuSubTab === 'combos'
                          ? 'bg-[#004700] border-[#004700] text-white'
                          : 'bg-white border-theoh-border text-theoh-brown hover:border-theoh-orange/30'
                      }`}
                    >
                      Signature Dishes ({filteredMenuCombos.length})
                    </button>
                  </div>

                  {/* Add item button */}
                  <button
                    onClick={handleOpenAddModal}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-theoh-orange hover:bg-[#B45014] text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0"
                  >
                    <Plus size={14} strokeWidth={3} />
                    <span>Add New Item</span>
                  </button>
                </div>

                {/* Sub-tab Views */}
                {menuLoadingState ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <RefreshCw size={28} className="animate-spin text-[#004700] mb-3" />
                    <p className="text-xs font-bold text-theoh-muted">Updating menu database...</p>
                  </div>
                ) : (
                  <>
                    {/* BASES Sub-tab */}
                    {menuSubTab === 'bases' && (
                      filteredMenuBases.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 border border-theoh-border/40 text-center">
                          <Layers className="mx-auto text-theoh-muted mb-4 animate-pulse" size={36} />
                          <h4 className="font-extrabold text-theoh-brown">No base items found</h4>
                          <p className="text-xs text-theoh-muted mt-1">Add your first breakfast oatmeal base or wheat bread slice!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredMenuBases.map((base) => (
                            <div 
                              key={base.id} 
                              className={`bg-white rounded-3xl border border-theoh-border/40 overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                                base.inStock === false ? 'opacity-70 bg-gray-50/50' : ''
                              }`}
                            >
                              <div className="relative h-44 bg-theoh-beige">
                                <div 
                                  className="w-full h-full bg-cover bg-center" 
                                  style={{ backgroundImage: `url(${base.image || 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=300&q=80'})` }}
                                />
                                {base.inStock === false && (
                                  <div className="absolute inset-0 bg-white/20 backdrop-blur-[0.5px] flex items-center justify-center">
                                    <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg">Out of Stock</span>
                                  </div>
                                )}
                              </div>
                              <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-black text-theoh-brown text-sm sm:text-base leading-snug">{base.name}</h4>
                                    <span className="font-black text-theoh-orange text-base shrink-0">{formatINR(base.price)}</span>
                                  </div>
                                  <p className="text-xs text-theoh-muted leading-relaxed line-clamp-2">{base.desc || 'No description provided.'}</p>
                                  {base.tags && base.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {base.tags.map(t => (
                                        <span key={t} className="text-[8px] font-black uppercase bg-theoh-beige text-theoh-brown px-1.5 py-0.5 rounded border border-theoh-border/45">{t}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between border-t border-theoh-border/20 pt-4 mt-1">
                                  <div className="flex items-center gap-2">
                                    {/* Stock Switch */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleStock(base)}
                                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        base.inStock !== false ? 'bg-[#004700]' : 'bg-gray-300'
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                          base.inStock !== false ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                    <span className="text-[11px] font-bold text-theoh-brown uppercase tracking-wider">
                                      {base.inStock !== false ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleOpenEditModal(base)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all"
                                      title="Edit details"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMenuItem(base.id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all"
                                      title="Delete item"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {/* COMBOS Sub-tab */}
                    {menuSubTab === 'combos' && (
                      filteredMenuCombos.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 border border-theoh-border/40 text-center">
                          <Sparkles className="mx-auto text-theoh-muted mb-4 animate-pulse" size={36} />
                          <h4 className="font-extrabold text-theoh-brown">No signature dishes found</h4>
                          <p className="text-xs text-theoh-muted mt-1">Create a popular oatmeal + toppings house combination!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredMenuCombos.map((combo) => (
                            <div 
                              key={combo.id} 
                              className={`bg-white rounded-3xl border border-theoh-border/40 overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                                combo.inStock === false ? 'opacity-70 bg-gray-50/50' : ''
                              }`}
                            >
                              <div className="relative h-44 bg-theoh-beige">
                                <div 
                                  className="w-full h-full bg-cover bg-center" 
                                  style={{ backgroundImage: `url(${combo.image || 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=300&q=80'})` }}
                                />
                                {combo.inStock === false && (
                                  <div className="absolute inset-0 bg-white/20 backdrop-blur-[0.5px] flex items-center justify-center">
                                    <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg">Out of Stock</span>
                                  </div>
                                )}
                              </div>
                              <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-black text-theoh-brown text-sm sm:text-base leading-snug">{combo.name}</h4>
                                    <span className="font-black text-theoh-orange text-base shrink-0">{formatINR(combo.price)}</span>
                                  </div>
                                  <p className="text-xs text-theoh-orange font-bold uppercase">Base: {combo.base}</p>
                                  <p className="text-xs text-theoh-muted leading-relaxed">
                                    Toppings: {combo.addons && Array.isArray(combo.addons) ? combo.addons.join(' • ') : 'None'}
                                  </p>
                                  {combo.tag && (
                                    <span className="inline-block text-[8px] font-black uppercase bg-theoh-lightOrange text-theoh-orange px-2 py-0.5 rounded border border-theoh-orange/15">{combo.tag}</span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between border-t border-theoh-border/20 pt-4 mt-1">
                                  <div className="flex items-center gap-2">
                                    {/* Stock Switch */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleStock(combo)}
                                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        combo.inStock !== false ? 'bg-[#004700]' : 'bg-gray-300'
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                          combo.inStock !== false ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                    <span className="text-[11px] font-bold text-theoh-brown uppercase tracking-wider">
                                      {combo.inStock !== false ? 'Active' : 'Disabled'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleOpenEditModal(combo)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all"
                                      title="Edit details"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMenuItem(combo.id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all"
                                      title="Delete combo"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {/* ADDONS Sub-tab */}
                    {menuSubTab === 'addons' && (
                      filteredMenuAddons.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 border border-theoh-border/40 text-center">
                          <Sparkles className="mx-auto text-theoh-muted mb-4 animate-pulse" size={36} />
                          <h4 className="font-extrabold text-theoh-brown">No addon toppings found</h4>
                          <p className="text-xs text-theoh-muted mt-1">Add raw organic seeds, berries, honey spreads or dry fruits!</p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {["Spreads & Sweeteners", "Fresh Fruits", "Premium Nuts", "Healthy Seeds"].map((categoryName) => {
                            const categoryAddons = filteredMenuAddons.filter(a => a.category === categoryName);
                            if (categoryAddons.length === 0) return null;

                            return (
                              <div key={categoryName} className="space-y-4">
                                <div className="border-b border-theoh-border/30 pb-2 flex items-center gap-2">
                                  <span className="w-1.5 h-4 bg-theoh-orange rounded-full" />
                                  <h4 className="font-black text-xs sm:text-sm text-theoh-brown uppercase tracking-wider">{categoryName}</h4>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                  {categoryAddons.map((addon) => (
                                    <div 
                                      key={addon.id}
                                      className={`bg-white rounded-2xl border border-theoh-border/40 p-4 shadow-sm flex flex-col justify-between gap-3 ${
                                        addon.inStock === false ? 'opacity-70 bg-gray-50/50' : ''
                                      }`}
                                    >
                                      <div className="flex gap-3">
                                        <div 
                                          className="w-12 h-12 rounded-xl bg-cover bg-center flex-shrink-0 bg-theoh-beige relative overflow-hidden"
                                          style={{ backgroundImage: `url(${addon.image || 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=150&q=80'})` }}
                                        >
                                          {addon.inStock === false && (
                                            <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center" />
                                          )}
                                        </div>
                                        <div className="min-w-0 flex-grow">
                                          <h5 className="font-bold text-theoh-brown text-xs sm:text-sm truncate leading-snug">{addon.name}</h5>
                                          <span className="text-xs font-black text-theoh-orange block mt-0.5">{formatINR(addon.price)}</span>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between border-t border-theoh-border/10 pt-3 mt-1 select-none">
                                        {/* Stock Switch */}
                                        <button
                                          type="button"
                                          onClick={() => handleToggleStock(addon)}
                                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            addon.inStock !== false ? 'bg-[#004700]' : 'bg-gray-300'
                                          }`}
                                        >
                                          <span
                                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                              addon.inStock !== false ? 'translate-x-4' : 'translate-x-0'
                                            }`}
                                          />
                                        </button>

                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => handleOpenEditModal(addon)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-md transition-all"
                                            title="Edit details"
                                          >
                                            <Edit2 size={11} />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteMenuItem(addon.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-md transition-all"
                                            title="Delete item"
                                          >
                                            <Trash2 size={11} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}
                  </>
                )}

              </div>
            )}
          </>
        )}

      </main>

      {/* Floating WebSockets Order Alerts Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="bg-white/95 backdrop-blur-md border-l-4 border-l-theoh-orange border-theoh-border/40 p-5 rounded-2xl shadow-xl flex gap-3 pointer-events-auto relative overflow-hidden"
            >
              {/* Custom auto-dismiss bar */}
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 10, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-1 bg-theoh-orange"
              />
              
              <div className="bg-[#E8F5E9] text-[#004700] p-2 rounded-xl flex-shrink-0 self-start">
                <ShoppingBag size={18} />
              </div>
              <div className="flex-grow pr-4">
                <span className="text-[10px] font-black uppercase text-theoh-orange tracking-wider flex items-center gap-1">
                  <Sparkles size={10} className="animate-pulse" />
                  New Order Received!
                </span>
                <h4 className="font-black text-theoh-brown text-sm leading-tight mt-0.5">{alert.order.id} ({formatINR(alert.order.totalPrice)})</h4>
                <p className="text-xs text-theoh-muted mt-1">Customer: <span className="font-bold">{alert.order.customer.name}</span></p>
                <p className="text-[10px] text-theoh-muted mt-0.5">Slot: {alert.order.customer.timeSlot}</p>
              </div>
              <button
                onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                className="text-theoh-muted hover:text-theoh-brown hover:bg-theoh-beige/50 p-1.5 rounded-lg self-start transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Glassmorphic Add/Edit Menu Item Modal */}
      <AnimatePresence>
        {showMenuModal && (
          <div className="fixed inset-0 bg-theoh-brown/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] border border-theoh-border/40 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-theoh-border/20 flex justify-between items-center bg-theoh-beige/25">
                <h3 className="font-black text-theoh-brown text-lg uppercase tracking-wide">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <button 
                  onClick={() => setShowMenuModal(false)}
                  className="text-theoh-muted hover:text-theoh-brown p-1.5 rounded-xl hover:bg-theoh-beige/50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleMenuFormSubmit} className="p-6 overflow-y-auto space-y-4 text-sm flex-grow">
                
                {/* Type selector (only editable when adding) */}
                <div>
                  <label className="block text-xs font-bold text-theoh-muted uppercase tracking-wider mb-1.5">Item Type</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-theoh-brown">
                      <input
                        type="radio"
                        disabled={!!editingItem}
                        checked={menuFormData.type === 'base'}
                        onChange={() => setMenuFormData(prev => ({ ...prev, type: 'base' }))}
                        className="text-[#004700] focus:ring-[#004700]"
                      />
                      <span>Base Bowl / Bread</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-theoh-brown">
                      <input
                        type="radio"
                        disabled={!!editingItem}
                        checked={menuFormData.type === 'addon'}
                        onChange={() => setMenuFormData(prev => ({ ...prev, type: 'addon' }))}
                        className="text-[#004700] focus:ring-[#004700]"
                      />
                      <span>Addon / Topping</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-theoh-brown">
                      <input
                        type="radio"
                        disabled={!!editingItem}
                        checked={menuFormData.type === 'combo'}
                        onChange={() => setMenuFormData(prev => ({ ...prev, type: 'combo' }))}
                        className="text-[#004700] focus:ring-[#004700]"
                      />
                      <span>Signature Dish</span>
                    </label>
                  </div>
                </div>

                {/* Category selector (only for addon) */}
                {menuFormData.type === 'addon' && (
                  <div>
                    <label className="block text-xs font-bold text-theoh-muted uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      value={menuFormData.category}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-theoh-border outline-none focus:border-[#004700] text-theoh-brown font-bold"
                    >
                      <option value="Spreads & Sweeteners">Spreads & Sweeteners</option>
                      <option value="Fresh Fruits">Fresh Fruits</option>
                      <option value="Premium Nuts">Premium Nuts</option>
                      <option value="Healthy Seeds">Healthy Seeds</option>
                    </select>
                  </div>
                )}

                {/* Tag field (only for Combo) */}
                {menuFormData.type === 'combo' && (
                  <div>
                    <label className="block text-xs font-bold text-theoh-muted uppercase tracking-wider mb-1.5">Highlight Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Best for Gym, High Energy"
                      value={menuFormData.tag || ''}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, tag: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-theoh-border outline-none focus:border-[#004700] text-theoh-brown font-bold placeholder-theoh-muted/65 bg-white"
                    />
                  </div>
                )}

                {/* Base selection (only for Combo) */}
                {menuFormData.type === 'combo' && (
                  <div>
                    <label className="block text-xs font-bold text-theoh-muted uppercase tracking-wider mb-1.5">Select Base Bowl / Bread</label>
                    <select
                      value={menuFormData.base}
                      required
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, base: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-theoh-border outline-none focus:border-[#004700] text-theoh-brown font-bold"
                    >
                      <option value="">-- Choose a Base --</option>
                      {menuBases.map(b => (
                        <option key={b.id} value={b.name}>{b.name} (₹{b.price})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Addons multi-select (only for Combo) */}
                {menuFormData.type === 'combo' && (
                  <div>
                    <label className="block text-xs font-bold text-theoh-muted uppercase tracking-wider mb-1.5">Select Addons & Toppings</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border border-theoh-border rounded-xl bg-theoh-beige/10">
                      {menuAddons.map(addon => {
                        const isChecked = menuFormData.addons?.includes(addon.name);
                        return (
                          <label key={addon.id} className="flex items-center gap-2 cursor-pointer font-medium text-theoh-brown text-xs">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setMenuFormData(prev => {
                                  const list = prev.addons || [];
                                  const newList = list.includes(addon.name)
                                    ? list.filter(name => name !== addon.name)
                                    : [...list, addon.name];
                                  return { ...prev, addons: newList };
                                });
                              }}
                              className="text-[#004700] focus:ring-[#004700] rounded"
                            />
                            <span>{addon.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-theoh-muted uppercase tracking-wider mb-1.5">Item Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Blueberries, Whole Grain Bread"
                    value={menuFormData.name}
                    onChange={(e) => setMenuFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-theoh-border outline-none focus:border-[#004700] text-theoh-brown font-bold placeholder-theoh-muted/65 bg-white"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-theoh-muted uppercase tracking-wider mb-1.5">Price (INR)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 45"
                    value={menuFormData.price}
                    onChange={(e) => setMenuFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-theoh-border outline-none focus:border-[#004700] text-theoh-brown font-bold placeholder-theoh-muted/65 bg-white"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-bold text-theoh-muted uppercase tracking-wider mb-1.5">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={menuFormData.image}
                    onChange={(e) => setMenuFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-theoh-border outline-none focus:border-[#004700] text-theoh-brown font-bold placeholder-theoh-muted/65 bg-white"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold text-theoh-muted uppercase tracking-wider mb-1.5">Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. High Protein, Fiber Rich"
                    value={menuFormData.tags}
                    onChange={(e) => setMenuFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-theoh-border outline-none focus:border-[#004700] text-theoh-brown font-bold placeholder-theoh-muted/65 bg-white"
                  />
                </div>

                {/* Description (only for Base) */}
                {menuFormData.type === 'base' && (
                  <div>
                    <label className="block text-xs font-bold text-theoh-muted uppercase tracking-wider mb-1.5">Description</label>
                    <textarea
                      rows="3"
                      placeholder="Provide a detailed description of the oatmeal or bread base..."
                      value={menuFormData.desc}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, desc: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-theoh-border outline-none focus:border-[#004700] text-theoh-brown font-medium placeholder-theoh-muted/65 bg-white resize-none"
                    />
                  </div>
                )}

                {/* Submit Actions */}
                <div className="flex gap-3 pt-4 border-t border-theoh-border/20 mt-6 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowMenuModal(false)}
                    className="px-5 py-2.5 border border-theoh-border hover:bg-theoh-beige/40 text-theoh-brown rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#004700] hover:bg-[#003000] text-white rounded-xl font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95 animate-fade-in"
                  >
                    <Check size={16} />
                    <span>{editingItem ? 'Save Changes' : 'Create Item'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

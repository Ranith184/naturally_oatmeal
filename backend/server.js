import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { getOrders, createOrder, updateOrderStatus, clearOrders } from './db.js';
import { getMenu, addMenuItem, updateMenuItem, deleteMenuItem } from './menuDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_theoh_key_987654';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from Vite build
const frontendDistPath = path.join(__dirname, '..', 'TheOh', 'theoh-breakfast', 'dist');
app.use(express.static(frontendDistPath));

// Create HTTP server and bind Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin Login
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } else {
    return res.status(401).json({ error: 'Incorrect password' });
  }
});

// Place new order (Public)
app.post('/api/orders', async (req, res) => {
  try {
    const { items, customer, totalPrice } = req.body;

    // Simple validations
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or invalid' });
    }
    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ error: 'Missing customer details' });
    }
    if (typeof totalPrice !== 'number') {
      return res.status(400).json({ error: 'Invalid total price' });
    }

    const newOrder = await createOrder({ items, customer, totalPrice });
    
    // Broadcast the new order to all connected socket clients (e.g. Admin Dashboard)
    io.emit('new_order', newOrder);
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get all orders (Protected)
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await getOrders();
    // Sort latest first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Clear all orders (Protected)
app.delete('/api/orders', authenticateToken, async (req, res) => {
  try {
    await clearOrders();
    io.emit('orders_cleared');
    res.json({ message: 'All orders cleared successfully' });
  } catch (error) {
    console.error('Error clearing orders:', error);
    res.status(500).json({ error: 'Failed to clear orders' });
  }
});

// Update order status (Protected)
app.patch('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updatedOrder = await updateOrderStatus(id, status);
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Broadcast update so the customer or dashboard knows instantly
    io.emit('order_status_updated', updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get Analytics (Protected)
app.get('/api/orders/stats', authenticateToken, async (req, res) => {
  try {
    const orders = await getOrders();
    
    // Key Stats
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const canceledOrders = orders.filter(o => o.status === 'canceled').length;
    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'canceled').length;
    
    const totalRevenue = orders
      .filter(o => o.status === 'delivered') // only count completed for revenue
      .reduce((sum, o) => sum + o.totalPrice, 0);
      
    const averageOrderValue = completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0;

    // Delivery slot breakdown
    const slotBreakdown = {};
    // Popular items breakdown
    const popularBases = {};
    const popularAddons = {};

    orders.forEach(order => {
      // Slot breakdown (all orders, or only active/completed)
      if (order.status !== 'canceled') {
        const slot = order.customer.timeSlot || 'Unknown';
        slotBreakdown[slot] = (slotBreakdown[slot] || 0) + 1;
        
        // Items breakdown
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

    res.json({
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
    });
  } catch (error) {
    console.error('Error computing stats:', error);
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

// --- Dynamic Menu Management Routes ---

// Get Menu (Public)
app.get('/api/menu', async (req, res) => {
  try {
    const menu = await getMenu();
    res.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Add Menu Item (Protected)
app.post('/api/menu/items', authenticateToken, async (req, res) => {
  try {
    const newItem = await addMenuItem(req.body);
    io.emit('menu_updated');
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(400).json({ error: error.message || 'Failed to add menu item' });
  }
});

// Update Menu Item (Protected)
app.put('/api/menu/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await updateMenuItem(id, req.body);
    if (!updatedItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    io.emit('menu_updated');
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete Menu Item (Protected)
app.delete('/api/menu/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteMenuItem(id);
    if (!success) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    io.emit('menu_updated');
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Catch-all route to serve index.html for client-side routing (React Router)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).send("Frontend build not found. Please build the frontend project first.");
    }
  });
});

// WebSockets Connection Logger
io.on('connection', (socket) => {
  console.log(`[WS] Admin/Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Naturally Eat & Fit Breakfast Server running on port ${PORT}`);
});

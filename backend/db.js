import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'orders.json');

// Initialize database
async function initDb() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      // Create empty orders file
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Read all orders
async function getOrders() {
  await initDb();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading orders:', err);
    return [];
  }
}

// Save all orders
async function saveOrders(orders) {
  await initDb();
  try {
    // Write atomically using a temporary file to prevent corruption
    const tempFile = `${DATA_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(orders, null, 2), 'utf-8');
    await fs.rename(tempFile, DATA_FILE);
    return true;
  } catch (err) {
    console.error('Error saving orders:', err);
    return false;
  }
}

// Insert new order
async function createOrder(orderData) {
  const orders = await getOrders();
  
  // Calculate next Order ID (e.g., TH-1001)
  let nextNumber = 1001;
  if (orders.length > 0) {
    // Find maximum numeric part
    const numbers = orders.map(o => {
      const match = o.id.match(/TH-(\d+)/);
      return match ? parseInt(match[1], 10) : 1000;
    });
    nextNumber = Math.max(...numbers) + 1;
  }
  
  const orderId = `TH-${nextNumber}`;
  
  const newOrder = {
    id: orderId,
    items: orderData.items,
    customer: orderData.customer,
    totalPrice: orderData.totalPrice,
    status: 'pending', // default status
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  const success = await saveOrders(orders);
  if (success) {
    return newOrder;
  }
  throw new Error('Failed to save order');
}

// Update order status
async function updateOrderStatus(id, status) {
  const orders = await getOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) {
    return null;
  }
  
  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  
  const success = await saveOrders(orders);
  if (success) {
    return orders[index];
  }
  throw new Error('Failed to update order status');
}

// Clear all orders
async function clearOrders() {
  const success = await saveOrders([]);
  if (success) {
    return true;
  }
  throw new Error('Failed to clear orders');
}

export {
  getOrders,
  createOrder,
  updateOrderStatus,
  clearOrders
};

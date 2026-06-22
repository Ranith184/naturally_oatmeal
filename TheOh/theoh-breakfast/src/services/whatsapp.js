import { WHATSAPP_NUMBER } from '../data';

/**
 * Formats the cart items and customer details into a premium WhatsApp message and redirects.
 * @param {Array} cartItems - The list of items in the cart
 * @param {Object} customerInfo - Customer checkout details (name, phone, address, timeSlot, notes)
 * @param {number} totalCartPrice - Pre-calculated total order amount
 */
export function placeOrderWhatsApp(cartItems, customerInfo, totalCartPrice, orderId) {
  if (!cartItems || cartItems.length === 0) return;

  const header = `🌿 *Naturally Eat & Fit (ఓట్స్ హాబిట్)* 🌿\n_Fresh Breakfast Order_ *(${orderId ? orderId : 'New'})*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  const customerDetails = `👤 *CUSTOMER DETAILS*\n` +
    `• *Name:* ${customerInfo.name}\n` +
    `• *Phone:* ${customerInfo.phone}\n` +
    `• *Delivery Address:* ${customerInfo.address}\n` +
    `• *Preferred Time:* ${customerInfo.timeSlot}\n` +
    (customerInfo.notes ? `• *Note:* ${customerInfo.notes}\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n\n`;

  const orderHeader = `🛒 *YOUR ORDER*\n`;
  const orderLines = cartItems.map((item, idx) => {
    const addonList = item.addons.length > 0 
      ? item.addons.map(a => `   └ 🔸 ${a.name} (+₹${a.price})`).join("\n") 
      : "   └ 🔸 No add-ons";
      
    const itemPrice = (item.base.price + item.addons.reduce((sum, a) => sum + a.price, 0)) * item.qty;
    
    return `*${idx + 1}. ${item.base.name}* (x${item.qty})\n${addonList}\n   *Item Total:* ₹${itemPrice}\n`;
  }).join("\n");

  const footer = `\n━━━━━━━━━━━━━━━━━━━━\n` +
    `📦 *Delivery Fee:* FREE\n` +
    `💰 *Grand Total:* *₹${totalCartPrice}*\n━━━━━━━━━━━━━━━━━━━━\n\n` +
    `_Thank you for choosing healthy! Please confirm my order._ 🌅`;

  const fullMessage = `${header}${customerDetails}${orderHeader}${orderLines}${footer}`;
  
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullMessage)}`;
  window.open(waUrl, "_blank");
}


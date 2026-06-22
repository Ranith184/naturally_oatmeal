import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { QuantitySelector } from '../ui/QuantitySelector';
import { CheckoutForm } from '../checkout/CheckoutForm';
import { formatINR } from '../../utils/currency';
import { api } from '../../services/api';
import { placeOrderWhatsApp } from '../../services/whatsapp';

export function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    changeCartItemQty,
    removeFromCart,
    totalCartPrice,
    clearCart,
  } = useCart();

  const [checkoutMode, setCheckoutMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    timeSlot: '8:00 AM - 9:00 AM',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (
      !/^\+?[0-9]{10,14}$/.test(formData.phone.replace(/[\s-]/g, ''))
    ) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          base: {
            name: item.base.name,
            price: item.base.price
          },
          addons: item.addons.map(a => ({
            name: a.name,
            price: a.price
          })),
          qty: item.qty
        })),
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          timeSlot: formData.timeSlot,
          notes: formData.notes
        },
        totalPrice: totalCartPrice
      };

      const result = await api.submitOrder(orderData);
      setPlacedOrder(result);
      
      // Clear the cart
      clearCart();
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        address: '',
        timeSlot: '8:00 AM - 9:00 AM',
        notes: '',
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {placedOrder ? (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsCartOpen(false);
                  setPlacedOrder(null);
                  setCheckoutMode(false);
                }}
                className="fixed inset-0 bg-black z-50"
              />

              {/* Success Screen */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.35 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col p-6 items-center justify-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <svg className="w-10 h-10 text-[#004700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                </div>

                <h2 className="text-2xl font-black text-[#004700] uppercase tracking-wide">
                  Order Confirmed!
                </h2>
                
                <div className="bg-theoh-beige/50 border border-theoh-border/40 p-4 rounded-2xl w-full my-6 text-left space-y-2">
                  <div className="flex justify-between border-b border-theoh-border/20 pb-2">
                    <span className="font-bold text-theoh-muted text-xs uppercase">Order ID</span>
                    <span className="font-black text-theoh-brown text-sm">{placedOrder.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-theoh-border/20 pb-2">
                    <span className="font-bold text-theoh-muted text-xs uppercase">Delivery Time</span>
                    <span className="font-bold text-theoh-brown text-xs">{placedOrder.customer.timeSlot}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="font-bold text-theoh-muted text-xs uppercase">Grand Total</span>
                    <span className="font-black text-[#004700] text-sm">{formatINR(placedOrder.totalPrice)}</span>
                  </div>
                </div>

                <p className="text-sm text-theoh-muted leading-relaxed mb-8 px-4 font-medium">
                  Thank you for choosing Naturally Eat & Fit, <span className="font-bold text-theoh-brown">{placedOrder.customer.name}</span>! We have saved your order in our database. Click below to confirm via WhatsApp so we can coordinate your fresh morning delivery.
                </p>

                <div className="w-full space-y-3">
                  <button
                    onClick={() => {
                      placeOrderWhatsApp(placedOrder.items, placedOrder.customer, placedOrder.totalPrice, placedOrder.id);
                    }}
                    className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-green-100 hover:shadow-green-200 transition-all active:scale-98"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.419 9.86-9.86.002-2.636-1.02-5.115-2.879-6.973-1.859-1.859-4.339-2.88-6.976-2.881-5.441 0-9.86 4.419-9.863 9.86-.001 1.742.483 3.442 1.402 4.965l-.982 3.587 3.673-.962zm10.702-7.086c-.229-.115-1.354-.669-1.564-.745-.21-.077-.362-.115-.515.115-.152.23-.591.746-.724.896-.133.15-.266.168-.495.053-.23-.115-.968-.357-1.844-1.14-.682-.61-1.144-1.362-1.278-1.592-.133-.23-.014-.354.101-.469.103-.104.229-.267.344-.401.115-.134.152-.23.23-.383.076-.153.038-.287-.019-.402-.057-.115-.515-1.242-.705-1.7-.186-.447-.369-.387-.515-.395-.133-.007-.285-.008-.438-.008-.153 0-.402.057-.612.287-.21.23-.803.785-.803 1.916 0 1.13.822 2.222.937 2.375.115.153 1.618 2.47 3.92 3.467.548.237 1.036.378 1.39.49.55.175 1.05.15 1.447.09.44-.067 1.354-.553 1.545-1.06.19-.507.19-.941.133-1.06-.057-.115-.21-.186-.44-.301z"/>
                    </svg>
                    <span>Confirm on WhatsApp</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setPlacedOrder(null);
                      setCheckoutMode(false);
                    }}
                    className="w-full bg-theoh-beige hover:bg-theoh-border/40 text-theoh-brown py-3 rounded-2xl font-bold transition-all"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsCartOpen(false);
                  setCheckoutMode(false);
                }}
                className="fixed inset-0 bg-black z-50"
              />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-theoh-beige z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-theoh-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-theoh-brown">
                <ShoppingBag
                  size={20}
                  className="text-[#004700]"
                />
                <h2 className="text-lg font-black uppercase tracking-wide">
                  Your Cart
                </h2>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setCheckoutMode(false);
                }}
                className="p-1.5 rounded-full hover:bg-theoh-beige transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                    <ShoppingBag
                      size={34}
                      className="text-[#004700]"
                    />
                  </div>

                  <h3 className="mt-4 font-black text-lg text-theoh-brown">
                    Your cart is empty
                  </h3>

                  <p className="text-sm text-theoh-muted mt-2 max-w-[250px] leading-relaxed">
                    Build your healthy breakfast bowl with oats,
                    fruits, nuts, and seeds.
                  </p>

                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-5 bg-[#004700] hover:bg-[#003300] text-white px-6 py-3 rounded-full font-semibold transition-all"
                  >
                    Build Breakfast
                  </button>
                </div>
              ) : (
                <>
                  {!checkoutMode ? (
                    <div className="space-y-3">
                      {cartItems.map((item) => {
                        const basePrice = item.base.price;

                        const addonsPrice = item.addons.reduce(
                          (sum, addon) => sum + addon.price,
                          0
                        );

                        const itemPrice =
                          (basePrice + addonsPrice) * item.qty;

                        return (
                          <div
                            key={item.id}
                            className="bg-white p-4 rounded-2xl border border-theoh-border/50 shadow-sm flex gap-4"
                          >
                            {/* Image */}
                            <div
                              className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0"
                              style={{
                                backgroundImage: `url(${item.base.image})`,
                              }}
                            />

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between gap-2">
                                <div>
                                  <h4 className="font-black text-theoh-brown text-base leading-tight">
                                    {item.base.name}
                                  </h4>

                                  {item.addons.length > 0 ? (
                                    <p className="text-sm text-theoh-muted mt-1 leading-relaxed">
                                      +{' '}
                                      {item.addons
                                        .map((a) => a.name)
                                        .join(', ')}
                                    </p>
                                  ) : (
                                    <p className="text-xs uppercase tracking-wide text-theoh-muted mt-1">
                                      No add-ons selected
                                    </p>
                                  )}
                                </div>

                                <button
                                  onClick={() =>
                                    removeFromCart(item.id)
                                  }
                                  className="text-red-400 hover:text-red-600 transition-all"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>

                              {/* Bottom */}
                              <div className="flex justify-between items-center mt-4 pt-4 border-t border-theoh-border/20">
                                <QuantitySelector
                                  quantity={item.qty}
                                  onChange={(newQty) =>
                                    changeCartItemQty(
                                      item.id,
                                      newQty - item.qty
                                    )
                                  }
                                  size="sm"
                                />

                                <span className="font-black text-[#004700] text-xl">
                                  {formatINR(itemPrice)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={() =>
                          setCheckoutMode(false)
                        }
                        className="text-sm font-bold text-[#004700]"
                      >
                        ← Back to Cart Items
                      </button>

                      <CheckoutForm
                        formData={formData}
                        onChange={handleInputChange}
                        errors={errors}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Summary */}
            {cartItems.length > 0 && (
              <div className="bg-white border-t border-theoh-border/40 p-4 space-y-3">
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-theoh-muted">
                    <span>Order Subtotal</span>

                    <span className="font-semibold text-theoh-brown">
                      {formatINR(totalCartPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-theoh-muted">
                    <span>Morning Delivery</span>

                    <span className="font-semibold text-[#004700]">
                      FREE
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-theoh-border/20">
                    <span className="font-black text-xl text-theoh-brown">
                      Grand Total
                    </span>

                    <span className="font-black text-2xl text-[#004700]">
                      {formatINR(totalCartPrice)}
                    </span>
                  </div>
                </div>

                {submitError && (
                  <p className="text-red-500 text-xs font-semibold text-center mt-2 bg-red-50 p-2 rounded-xl border border-red-100">
                    {submitError}
                  </p>
                )}

                {/* Button */}
                {!checkoutMode ? (
                  <button
                    onClick={() => setCheckoutMode(true)}
                    className="w-full bg-[#004700] hover:bg-[#003300] text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <span>Proceed to Delivery Info</span>

                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="w-full bg-[#004700] hover:bg-[#003300] text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>

                    {!isSubmitting && <ArrowRight size={18} />}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
        </>
      )}
    </AnimatePresence>
  );
}
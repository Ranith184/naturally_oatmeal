import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/currency';

export function FloatingCart() {
  const { totalCartItems, totalCartPrice, isCartOpen, setIsCartOpen } = useCart();

  return (
    <AnimatePresence>
      {totalCartItems > 0 && !isCartOpen && (
        <motion.button
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: [0, -6, 0] // gentle oscillation loop
          }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{
            y: {
              repeat: Infinity,
              duration: 2.5,
              ease: "easeInOut"
            },
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center gap-3 bg-[#004700] text-white py-3.5 px-5.5 rounded-full shadow-floating hover:bg-[#003300] transition-all select-none whitespace-nowrap md:bottom-8 md:right-8"
        >
          <div className="relative mr-1 flex items-center">
            <ShoppingCart size={18} className="text-white" />
            <span className="absolute -top-2 -right-2.5 min-w-4 h-4 flex items-center justify-center rounded-full bg-white text-[#004700] text-[9px] font-black border border-[#004700] px-0.5">
              {totalCartItems}
            </span>
          </div>
          <span className="font-extrabold uppercase tracking-wider text-xs">
            View Cart ({formatINR(totalCartPrice)})
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

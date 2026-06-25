import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export function FloatingCart() {
  const { totalCartItems, isCartOpen, setIsCartOpen } = useCart();

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
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#004700] text-white shadow-floating hover:bg-[#003300] transition-all select-none md:bottom-8 md:right-8"
        >
          <div className="relative flex items-center justify-center">
            <ShoppingCart size={22} className="text-white" />
            <span className="absolute -top-2.5 -right-2.5 min-w-5 h-5 flex items-center justify-center rounded-full bg-white text-[#004700] text-[10px] font-black border border-[#004700] px-1 shadow-sm">
              {totalCartItems}
            </span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

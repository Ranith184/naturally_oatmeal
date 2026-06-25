import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CartDrawer } from '../components/cart/CartDrawer';
import { FloatingCart } from '../components/cart/FloatingCart';

export function MainLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-theoh-beige font-sans">
      {/* Global Header */}
      <Navbar />

      {/* Primary Page Router Outlet */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Global persistent Footer */}
      <Footer />

      {/* Cart Drawer overlay */}
      <CartDrawer />

      {/* Mobile Floating Cart Action Button */}
      <FloatingCart />
    </div>
  );
}

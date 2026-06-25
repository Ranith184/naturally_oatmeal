// src/components/common/Navbar.jsx
import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { pathname } = useLocation();

  const linkStyles = ({ isActive }) =>
    `text-sm font-semibold tracking-wide uppercase transition-colors duration-200 py-1.5 px-3 rounded-full ${isActive
      ? 'bg-theoh-lightOrange text-theoh-orange font-bold'
      : 'text-theoh-muted hover:text-theoh-brown'
    }`;

  // ----- scroll handling -----
  const [scrolled, setScrolled] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine background state
      setScrolled(currentScrollY > 50);

      // Hide or show navbar based on scroll direction
      if (currentScrollY <= 80) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = pathname === '/';
  const navBgClass = (isHomePage && !scrolled)
    ? 'bg-transparent' // fully transparent on home page when at the top
    : 'bg-theoh-beige/95 backdrop-blur-md border-b border-theoh-border shadow-sm'; // premium background on subpages or when scrolled

  const handleNavClick = () => {
    window.scrollTo(0, 0);
  };

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <nav
      className={`sticky top-0 z-40 w-full ${navBgClass} transform transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo Brand */}
          <Link to="/" onClick={handleNavClick} className="flex items-center gap-2 group">
            <span className="p-1.5 rounded-xl bg-theoh-orange text-white group-hover:scale-105 transition-transform">
              <Leaf size={18} className="rotate-45" />
            </span>
            <span className="text-xl sm:text-2xl font-black text-theoh-brown tracking-widest font-sans uppercase">
              Naturally Eat & Fit
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" onClick={handleNavClick} className={linkStyles}>Home</NavLink>
            <NavLink to="/menu" onClick={handleNavClick} className={linkStyles}>Build Menu</NavLink>
            <NavLink to="/about" onClick={handleNavClick} className={linkStyles}>Our Story</NavLink>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Menu Link (hidden on tiny screens if hamburger takes over, but we can keep it for quick order) */}
            <Link
              to="/menu"
              onClick={handleNavClick}
              className="hidden sm:block md:hidden text-xs font-bold uppercase tracking-wider text-theoh-orange border border-theoh-orange/30 px-3 py-1.5 rounded-full bg-theoh-lightOrange/30 hover:bg-theoh-lightOrange/50 transition-colors"
            >
              Order Now
            </Link>



            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-full text-theoh-brown bg-theoh-beige hover:bg-theoh-border/40 transition-colors ml-1"
              aria-label="Open Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Sliding Menu */}
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      style={{ backgroundColor: 'floralwhite' }}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <div
        className={`absolute right-0 top-0 bottom-0 w-64 shadow-2xl flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ backgroundColor: 'floralwhite' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-theoh-border/40">
          <span className="text-lg font-black text-theoh-brown tracking-widest font-sans uppercase">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-full hover:bg-theoh-border/40 text-theoh-brown transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col p-6 gap-6">
          <NavLink to="/" onClick={handleMobileNavClick} className={linkStyles}>Home</NavLink>
          <NavLink to="/menu" onClick={handleMobileNavClick} className={linkStyles}>Build Menu</NavLink>
          <NavLink to="/about" onClick={handleMobileNavClick} className={linkStyles}>Our Story</NavLink>
        </div>
        <div className="mt-auto p-6 border-t border-theoh-border/40">
          <Link
            to="/menu"
            onClick={handleMobileNavClick}
            className="w-full flex items-center justify-center bg-theoh-orange text-white font-bold py-3 rounded-full uppercase tracking-wider"
          >
            Order Now
          </Link>
        </div>
      </div>
    </div>
  </>
);
}

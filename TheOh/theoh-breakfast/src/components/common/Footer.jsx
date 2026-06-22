import React from 'react';
import { Instagram, MapPin, Mail, Phone, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-theoh-brown text-[#FFD89E] border-t border-[#442C16] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center md:items-start text-center md:text-left">
          
          {/* Logo Brand & Slogan */}
          <div>
            <h3 className="text-2xl font-black tracking-widest text-[#FFD89E] uppercase mb-3">
              Naturally Eat & Fit
            </h3>
            <p className="text-[#E8D9C4] text-xs font-bold uppercase tracking-wider mb-2">
              ఓట్స్ హాబిట్ — Oat's Habit
            </p>
            <p className="text-[#C4B4A4] text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              Hyderabad's premium morning nourishment service. Fresh ingredients, custom-made bowls, delivered directly to your doorstep.
            </p>
          </div>

          {/* Core Belief / USP */}
          <div className="md:px-8">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Our Standard
            </h4>
            <ul className="text-[#C4B4A4] text-sm space-y-2.5">
              <li className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-theoh-softOrange">🌅</span> Prepared fresh daily before 6 AM
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-theoh-softOrange">🥗</span> 100% natural, no additives
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-theoh-softOrange">🌾</span> Organic rolled oats & artisanal breads
              </li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Connect With Us
            </h4>
            <div className="flex flex-col items-center md:items-start gap-3.5 text-sm text-[#C4B4A4]">
              <a 
                href="https://www.instagram.com/naturally.eat.fit" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2.5 hover:text-white transition-colors group"
              >
                <span className="p-2 rounded-full bg-[#4E341A] group-hover:bg-theoh-orange group-hover:text-white transition-colors">
                  <Instagram size={15} />
                </span>
                <span>@naturally.eat.fit on Instagram</span>
              </a>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-full bg-[#4E341A]">
                  <MapPin size={15} />
                </span>
                <span>Malkam Cheruvu, Heritage Rocks, Hyderabad</span>
              </div>
            </div>
          </div>

        </div>

        {/* Separator line */}
        <div className="border-t border-[#4E341A] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-center gap-4 text-xs text-[#C4B4A4]">
          <p>© {new Date().getFullYear()} Naturally Eat & Fit Breakfast Co. All rights reserved.</p>
          <p className="flex items-center gap-1.5 justify-center">
            Handcrafted with <Heart size={12} className="text-theoh-orange fill-theoh-orange animate-pulse" /> in Hyderabad
          </p>
        </div>

      </div>
    </footer>
  );
}

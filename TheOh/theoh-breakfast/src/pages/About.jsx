import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Heart, ShieldCheck, Milk, Package } from 'lucide-react';
import { STORY_BG } from '../data';

export function About() {
  const values = [
    { 
      icon: <Milk size={28} className="text-[#3F51B5]" />, 
      title: "Organic Buffalo Milk", 
      desc: "Rich, creamy, and sourced from local grass-fed buffaloes. No milk powders, no synthetic additives." 
    },
    { 
      icon: <Package size={28} className="text-[#E8894A]" />, 
      title: "Eco-Friendly Packaging", 
      desc: "100% plastic-free, compostable, biodegradable boxes and utensils. Savor breakfast while preserving nature." 
    },
    { 
      icon: <ShieldCheck size={28} className="text-theoh-green" />, 
      title: "Zero Sugar & Colors", 
      desc: "We focus on real whole ingredients. Zero chemical preservatives, zero refined sugars, and zero coloring agents." 
    },
    { 
      icon: <Heart size={28} className="text-[#E91E63]" />, 
      title: "Hyderabad Sourced", 
      desc: "Deeply rooted in Hyderabad. Sourcing direct from local fruit orchards, dairy farms, and artisanal bakers." 
    },
  ];

  return (
    <div className="bg-theoh-beige pb-20">
      {/* Narrative Page Header */}
      <section className="relative overflow-hidden min-h-[40vh] flex items-center justify-center py-20 px-4 text-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(rgba(30, 20, 10, 0.65), rgba(30, 20, 10, 0.8)), url(${STORY_BG})`,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-white">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl font-black mb-4 uppercase tracking-wider"
          >
            Our Story
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-[#FFD89E] font-medium uppercase tracking-wider"
          >
            ఓట్స్ హాబిట్ — Oat's Habit • Born in Hyderabad
          </motion.p>
        </div>
      </section>

      {/* Main Narrative card */}
      <section className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-theoh-cream p-8 sm:p-12 rounded-3xl border border-theoh-border shadow-premium text-theoh-text leading-relaxed"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-theoh-brown mb-6">
            What is Naturally Eat & Fit?
          </h2>
          <p className="mb-6 text-[#4A3520] text-sm sm:text-base">
            Naturally Eat & Fit started as a small, passionate kitchen experiment in Hyderabad. We noticed a recurring problem: busy professionals, fitness enthusiasts, and health-conscious eaters wanted a clean, nutrient-dense breakfast but lacked the time to wash fruits, shell nuts, and prepare rolled oatmeal at 6:30 AM.
          </p>
          <p className="mb-6 text-[#4A3520] text-sm sm:text-base">
            We believe that what you eat in the first hour of your morning outlines the trajectory of your entire day. Our concept is straightforward: we source 100% organic rolled oats, prepare delicious slow-soaked mixtures using **pure organic buffalo milk**, source direct-from-farm fresh berries and seasonal fruits, make our almond and peanut spreads in-house, and deliver it exactly as you build it.
          </p>
          <p className="mb-6 text-[#4A3520] text-sm sm:text-base">
            Purity and sustainability run deep in everything we do. We refuse to use refined sugars, artificial colorings, or chemical preservatives — zero sugars, zero colorings, and nothing bad. To match our pure ingredients, our delivery boxes are **100% eco-friendly and plastic-free**. Every bowl is delivered in compostable packaging with wooden spoons because caring for your body goes hand in hand with protecting our environment.
          </p>
          <p className="text-[#4A3520] font-semibold text-sm sm:text-base">
            No long storage processes. No complex ingredient lists. Just real whole food, custom-crafted by you, prepared fresh by us, delivered cold in eco-friendly boxes before you start your workday.
          </p>
        </motion.div>
      </section>

      {/* Core Values grid */}
      <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-theoh-orange bg-theoh-lightOrange px-3.5 py-1.5 rounded-full">
            Our Foundations
          </span>
          <h2 className="text-3xl font-extrabold text-theoh-brown mt-4">
            Principles We Stand By
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((val, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              key={val.title}
              className="bg-theoh-cream p-8 rounded-2xl border border-theoh-border/60 shadow-premium hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <div className="p-4 rounded-full bg-white shadow-sm inline-flex items-center justify-center mb-6">
                {val.icon}
              </div>
              <h3 className="text-base font-bold text-theoh-brown mb-2">{val.title}</h3>
              <p className="text-theoh-muted text-xs leading-relaxed">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

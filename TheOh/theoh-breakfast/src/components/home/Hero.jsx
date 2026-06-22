import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Leaf, Sparkles, Star, RotateCcw } from 'lucide-react';
import { HERO_BG } from '../../data';

export function Hero() {
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const videoSrc = "/assets/videos/breakfast_hero.mp4";

  const handleVideoEnd = () => {
    setIsVideoEnded(true);
  };

  const handleReplay = () => {
    setIsVideoEnded(false);
    // Find the video element and reset playback
    const videoEl = document.getElementById('hero-video');
    if (videoEl) {
      videoEl.currentTime = 0;
      videoEl.play().catch(err => console.log("Video replay error:", err));
    }
  };

  return (
    <section
      className={`relative overflow-hidden min-h-[92vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-1000 ease-in-out ${isVideoEnded ? 'bg-[#EAE3DC]' : 'bg-theoh-beige'
        }`}
    >

      {/* 1. Cinematic Background Video (plays once, then fades out) */}
      <motion.video
        id="hero-video"
        autoPlay
        muted
        loop
        playsInline
        onEnded={handleVideoEnd}
        className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none filter brightness-110"
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </motion.video>

      {/* 2. Soft Dark Gradient & Overlays (fade out when video ends) */}
      <motion.div
        animate={{ opacity: isVideoEnded ? 0 : 0.55 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-theoh-brown/85 z-10 pointer-events-none"
      />
      <motion.div
        animate={{ opacity: isVideoEnded ? 0 : 0.15 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-r from-theoh-orange/15 via-transparent to-[#000000]/15 z-10 pointer-events-none"
      />

      {/* Decorative floating organic light particles (only active when video is playing) */}
      <AnimatePresence>
        {!isVideoEnded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/4 left-1/3 w-72 h-72 bg-theoh-green/10 rounded-full blur-3xl z-10 pointer-events-none"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-theoh-orange/10 rounded-full blur-3xl z-10 pointer-events-none"
            />
          </>
        )}
      </AnimatePresence>

      {/* Minimal overlay on video */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12 md:px-16 text-white z-20"
      >
        <div className="flex flex-col max-w-lg space-y-4">
          <div className="flex items-center gap-2">
            <Leaf size={24} className="text-white" />
            <span className="text-xs font-black uppercase tracking-[0.2em] bg-[#F5ECE3]/30 border border-[#EADBCC]/30 px-3 py-1 rounded-full">
              Naturally Eat & Fit <span className="text-theoh-orange font-black">·</span> Breakfast Club
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-snug">
            Start Your Morning <br />
            <span className="text-theoh-orange">The Right Way</span>
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-md">
            Watch premium oats, farm-picked berries, and natural peanut spreads fall together in perfect harmony.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link
              to="/menu"
              className="flex items-center justify-center gap-2 bg-theoh-orange hover:bg-[#B45014] text-white font-bold py-3 px-6 rounded-full"
            >
              <span>Order Now</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/menu"
              className="flex items-center justify-center gap-2 bg-[#F5ECE3] hover:bg-[#EADBCC] text-[#5C3D20] font-bold py-3 px-6 rounded-full"
            >
              <Sparkles size={16} className="text-theoh-orange" />
              <span>Explore Ingredients</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex text-[#F4A61D]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#F4A61D" strokeWidth={0} />
              ))}
            </div>
            <span className="text-sm">(4.9/5 Rating from over 800+ Hyd Homes)</span>
          </div>
          {isVideoEnded && (
            <button
              onClick={handleReplay}
              className="mt-2 flex items-center gap-1 text-theoh-orange hover:text-[#B45014] transition-colors border border-theoh-orange/20 hover:border-theoh-orange/60 bg-white px-3 py-1 rounded-full text-xs font-bold w-fit"
            >
              <RotateCcw size={11} />
              <span>Replay Video</span>
            </button>
          )}
        </div>
      </motion.div>
    </section>
  );
}

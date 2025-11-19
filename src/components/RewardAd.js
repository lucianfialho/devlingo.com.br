"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

/**
 * RewardAd - Componente de anúncio com recompensa estilo Duolingo
 */
export default function RewardAd({
  show = false,
  onComplete,
  adSlot,
  minWatchTime = 5,
  rewardMessage = "Aguarde para continuar..."
}) {
  const [timeWatched, setTimeWatched] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  
  useEffect(() => {
    if (!show) {
      setTimeWatched(0);
      setCanSkip(false);
      return;
    }
    
    // Timer para contar tempo de visualização
    const timer = setInterval(() => {
      setTimeWatched(prev => {
        const newTime = prev + 1;
        
        // Habilitar skip após tempo mínimo
        if (newTime >= minWatchTime) {
          setCanSkip(true);
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [show, minWatchTime]);
  
  // Carregar ad quando componente monta
  useEffect(() => {
    if (show) {
      try {
        if (typeof window !== 'undefined') {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        }
      } catch (error) {
        console.error('❌ Error loading reward ad:', error);
      }
    }
  }, [show]);
  
  const handleContinue = () => {
    if (canSkip && onComplete) {
      onComplete();
    }
  };
  
  const progressPercentage = Math.min((timeWatched / minWatchTime) * 100, 100);
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4"
        >
          {/* Timer no canto superior direito */}
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <div className="relative w-16 h-16">
              {/* Circular progress */}
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#E5E5E5"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={canSkip ? "#58CC02" : "#1CB0F6"}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercentage / 100)}`}
                  className="transition-all duration-300"
                />
              </svg>
              {/* Timer number */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-[#3C3C3C]">
                  {canSkip ? '✓' : minWatchTime - timeWatched}
                </span>
              </div>
            </div>
          </div>

          <div className="w-[60vw] max-w-4xl">

            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">
                {canSkip ? '✨' : '⏳'}
              </div>
              <h2 className="text-2xl font-bold text-[#3C3C3C] mb-2">
                {canSkip ? 'Pronto para começar!' : 'Aguarde um momento'}
              </h2>
              <p className="text-[#777777]">
                {canSkip ? rewardMessage : 'Assista ao anúncio para continuar'}
              </p>
            </div>
            
            {/* Ad Container - 9:16 optimized */}
            <div className="bg-[#F7F7F7] rounded-xl border border-[#E5E5E5] p-6 mb-6 min-h-[400px] flex items-center justify-center">
              <ins
                className="adsbygoogle"
                style={{ 
                  display: 'block',
                  width: '100%',
                  minHeight: '400px'
                }}
                data-ad-client="ca-pub-5795702444937299"
                data-ad-slot={adSlot}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
            
            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={!canSkip}
              className="w-full"
              size="lg"
            >
              {canSkip ? 'CONTINUAR' : `AGUARDE ${minWatchTime - timeWatched}S`}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

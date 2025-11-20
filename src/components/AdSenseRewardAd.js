"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

/**
 * AdSenseRewardAd - Componente de anúncio "recompensado" usando AdSense normal
 * 
 * Mantém a UX de "assistir anúncio" mas usa AdSense normal ao invés de GPT.
 * Usuário clica no botão → vê o anúncio por tempo mínimo → pode continuar
 */
export default function AdSenseRewardAd({
  show = false,
  onRewardGranted,
  adSlot,
  minWatchTime = 5,
  buttonText = "ASSISTIR ANÚNCIO",
  rewardMessage = "Assista ao anúncio para continuar",
  icon = "🎁"
}) {
  const [isWatching, setIsWatching] = useState(false);
  const [timeWatched, setTimeWatched] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  // Timer para contar tempo de visualização
  useEffect(() => {
    if (!isWatching) return;

    const timer = setInterval(() => {
      setTimeWatched(prev => {
        const newTime = prev + 1;
        
        if (newTime >= minWatchTime) {
          setCanContinue(true);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isWatching, minWatchTime]);

  // Carregar anúncio quando usuário clica para assistir
  useEffect(() => {
    if (isWatching && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar anúncio:', error);
      }
    }
  }, [isWatching]);

  // Reset quando componente desmontar ou show mudar
  useEffect(() => {
    if (!show) {
      setIsWatching(false);
      setTimeWatched(0);
      setCanContinue(false);
      setAdLoaded(false);
    }
  }, [show]);

  const handleStartWatching = () => {
    // Enviar evento para Google Analytics
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'view_reward',
        ad_slot: adSlot,
        button_text: buttonText
      });
    }
    
    setIsWatching(true);
  };

  const handleContinue = () => {
    if (canContinue && onRewardGranted) {
      onRewardGranted();
    }
  };

  const progressPercentage = Math.min((timeWatched / minWatchTime) * 100, 100);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4"
      >
        {/* Timer circular no canto superior direito - só quando assistindo */}
        {isWatching && (
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <div className="relative w-16 h-16">
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
                  stroke={canContinue ? "#58CC02" : "#1CB0F6"}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercentage / 100)}`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-[#3C3C3C]">
                  {canContinue ? '✓' : minWatchTime - timeWatched}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl">
          {!isWatching ? (
            /* Tela inicial - Botão para assistir */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-2xl text-center border-2 border-[#E5E5E5]"
            >
              {/* Ícone */}
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="text-7xl mb-4"
              >
                {icon}
              </motion.div>

              {/* Título */}
              <h2 className="text-2xl md:text-3xl font-bold text-[#3C3C3C] mb-3">
                Assista e Continue
              </h2>

              {/* Mensagem */}
              <p className="text-[#777777] text-lg mb-6">
                {rewardMessage}
              </p>

              {/* Botão */}
              <Button
                onClick={handleStartWatching}
                className="w-full"
                size="lg"
              >
                {buttonText}
              </Button>

              {/* Info */}
              <p className="text-xs text-[#AFAFAF] mt-4">
                ⏱️ Apenas {minWatchTime} segundos | 🔒 Você controla quando assistir
              </p>
            </motion.div>
          ) : (
            /* Tela de anúncio */
            <div className="w-full">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">
                  {canContinue ? '✨' : '⏳'}
                </div>
                <h2 className="text-2xl font-bold text-[#3C3C3C] mb-2">
                  {canContinue ? 'Pronto para continuar!' : 'Aguarde um momento'}
                </h2>
                <p className="text-[#777777]">
                  {canContinue ? rewardMessage : 'Assista ao anúncio para continuar'}
                </p>
              </div>
              
              {/* Ad Container */}
              <div className="bg-[#F7F7F7] rounded-xl border-2 border-[#E5E5E5] p-6 mb-6 min-h-[400px] flex items-center justify-center">
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
                disabled={!canContinue}
                className="w-full max-w-md mx-auto block"
                size="lg"
              >
                {canContinue ? 'CONTINUAR' : `AGUARDE ${minWatchTime - timeWatched}S`}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

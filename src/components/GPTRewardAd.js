"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

/**
 * GPTRewardAd - Componente de anúncio recompensado usando Google Publisher Tag
 * 
 * Exibe um botão que, quando clicado, mostra um rewarded ad do GPT.
 * Quando o usuário completa o anúncio, dispara o callback onRewardGranted.
 */
export default function GPTRewardAd({
  adUnitPath = '/21775744923/rewarded-ad', // Você precisará substituir pelo seu ad unit path
  show = false,
  onRewardGranted,
  onAdClosed,
  onError,
  buttonText = "Assistir Anúncio",
  rewardMessage = "Assista ao anúncio para continuar",
  icon = "🎁"
}) {
  const [rewardedSlot, setRewardedSlot] = useState(null);
  const [isAdReady, setIsAdReady] = useState(false);
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Inicializar rewarded slot
  useEffect(() => {
    if (!show || typeof window === 'undefined' || !window.googletag) return;

    const initRewardedSlot = () => {
      window.googletag.cmd.push(() => {
        // Definir slot de anúncio recompensado
        const slot = window.googletag.defineOutOfPageSlot(
          adUnitPath,
          window.googletag.enums.OutOfPageFormat.REWARDED
        );

        // Verificar se o slot foi criado (pode ser null em páginas sem suporte)
        if (!slot) {
          console.warn('Rewarded ad slot não é suportado nesta página');
          setErrorMessage('Anúncios recompensados não disponíveis nesta página');
          if (onError) {
            onError(new Error('Rewarded slot not supported'));
          }
          return;
        }

        // Adicionar listener para quando o slot estiver pronto
        slot.addService(window.googletag.pubads());

        // Listener para evento de recompensa concedida
        window.googletag.pubads().addEventListener('rewardedSlotGranted', (event) => {
          console.log('✅ Recompensa concedida!', event);
          if (event.slot === slot && onRewardGranted) {
            onRewardGranted();
          }
        });

        // Listener para quando o anúncio for fechado
        window.googletag.pubads().addEventListener('rewardedSlotClosed', (event) => {
          console.log('👋 Anúncio fechado');
          setIsShowingAd(false);
          if (event.slot === slot && onAdClosed) {
            onAdClosed();
          }
        });

        // Listener para quando o anúncio estiver pronto
        window.googletag.pubads().addEventListener('rewardedSlotReady', (event) => {
          console.log('🎯 Anúncio recompensado pronto');
          if (event.slot === slot) {
            setIsAdReady(true);
          }
        });

        // Listener para erros
        window.googletag.pubads().addEventListener('slotRenderEnded', (event) => {
          if (event.slot === slot && event.isEmpty) {
            console.warn('⚠️ Nenhum anúncio disponível');
            setErrorMessage('Nenhum anúncio disponível no momento');
            if (onError) {
              onError(new Error('No ad available'));
            }
          }
        });

        setRewardedSlot(slot);

        // Fazer display do slot (isso carrega o anúncio)
        window.googletag.display(slot);
      });
    };

    initRewardedSlot();

    return () => {
      // Cleanup: destruir slot quando componente desmontar
      if (rewardedSlot) {
        window.googletag.cmd.push(() => {
          window.googletag.destroySlots([rewardedSlot]);
        });
      }
    };
  }, [show, adUnitPath]); // Note: excluímos callbacks das dependências para evitar re-renders

  // Handler para mostrar anúncio
  const handleShowAd = useCallback(() => {
    if (!rewardedSlot || !isAdReady) {
      console.warn('Anúncio não está pronto');
      return;
    }

    setIsShowingAd(true);
    
    // Fazer display do rewarded ad
    window.googletag.cmd.push(() => {
      window.googletag.pubads().refresh([rewardedSlot]);
    });
  }, [rewardedSlot, isAdReady]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-b from-[#58CC02] to-[#47A302] flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full">
          {/* Card Principal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 shadow-2xl text-center"
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
              {errorMessage ? 'Ops!' : 'Assista e Continue'}
            </h2>

            {/* Mensagem */}
            <p className="text-[#777777] text-lg mb-6">
              {errorMessage || rewardMessage}
            </p>

            {/* Status do anúncio */}
            {!errorMessage && (
              <div className="mb-6">
                {isShowingAd ? (
                  <div className="flex items-center justify-center gap-2 text-[#58CC02]">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#58CC02]" />
                    <span className="font-medium">Carregando anúncio...</span>
                  </div>
                ) : isAdReady ? (
                  <div className="flex items-center justify-center gap-2 text-[#58CC02]">
                    <span className="text-xl">✓</span>
                    <span className="font-medium">Anúncio pronto!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-[#1CB0F6]">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1CB0F6]" />
                    <span className="font-medium">Preparando anúncio...</span>
                  </div>
                )}
              </div>
            )}

            {/* Botão */}
            {errorMessage ? (
              <Button
                onClick={() => onRewardGranted && onRewardGranted()}
                className="w-full"
                size="lg"
              >
                CONTINUAR SEM ANÚNCIO
              </Button>
            ) : (
              <Button
                onClick={handleShowAd}
                disabled={!isAdReady || isShowingAd}
                className="w-full"
                size="lg"
              >
                {isShowingAd ? 'ASSISTINDO...' : buttonText}
              </Button>
            )}

            {/* Info */}
            <p className="text-xs text-[#AFAFAF] mt-4">
              🔒 Você controla quando assistir o anúncio
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

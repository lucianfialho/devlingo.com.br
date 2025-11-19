"use client";

import { useEffect, useRef, useState } from 'react';

/**
 * RefreshBanner - Banner ad com refresh automático a cada 30s
 * 
 * Segue as políticas do Google AdSense para refresh:
 * - Apenas quando usuário está ativo
 * - Não refresh durante interação
 * - Máximo de refreshes por sessão
 * 
 * @param {string} adSlot - ID do slot de anúncio
 * @param {number} refreshInterval - Intervalo de refresh em ms (padrão: 30000)
 * @param {number} maxRefreshes - Máximo de refreshes por sessão (padrão: 10)
 * @param {function} onRefresh - Callback quando o ad é refreshed
 */
export default function RefreshBanner({
  adSlot,
  refreshInterval = 30000, // 30 segundos
  maxRefreshes = 10,
  onRefresh = null,
  className = ''
}) {
  const [refreshCount, setRefreshCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const adContainerRef = useRef(null);
  const refreshTimerRef = useRef(null);
  
  // Detectar interação do usuário
  useEffect(() => {
    const handleInteraction = () => {
      setLastInteraction(Date.now());
    };
    
    // Eventos de interação
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleInteraction);
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, []);
  
  // Lógica de refresh
  useEffect(() => {
    const refreshAd = () => {
      // Verificar se atingiu o máximo de refreshes
      if (refreshCount >= maxRefreshes) {
        console.log('🛑 Max refreshes reached');
        return;
      }
      
      // Verificar se houve interação recente (últimos 5 segundos)
      const timeSinceInteraction = Date.now() - lastInteraction;
      if (timeSinceInteraction < 5000) {
        console.log('⏸️ Skipping refresh - recent user interaction');
        return;
      }
      
      // Verificar se o ad está visível
      if (!isVisible) {
        console.log('⏸️ Skipping refresh - ad not visible');
        return;
      }
      
      try {
        // Remover ad antigo
        if (adContainerRef.current) {
          adContainerRef.current.innerHTML = '';
          
          // Criar novo ad
          const ins = document.createElement('ins');
          ins.className = 'adsbygoogle';
          ins.style.display = 'block';
          ins.setAttribute('data-ad-client', 'ca-pub-5795702444937299');
          ins.setAttribute('data-ad-slot', adSlot);
          ins.setAttribute('data-ad-format', 'horizontal');
          ins.setAttribute('data-full-width-responsive', 'true');
          
          adContainerRef.current.appendChild(ins);
          
          // Carregar novo ad
          if (typeof window !== 'undefined') {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
          
          setRefreshCount(prev => prev + 1);
          
          if (onRefresh) {
            onRefresh(refreshCount + 1);
          }
          
          console.log(`🔄 Ad refreshed (${refreshCount + 1}/${maxRefreshes})`);
        }
      } catch (error) {
        console.error('❌ Error refreshing ad:', error);
      }
    };
    
    // Configurar timer de refresh
    refreshTimerRef.current = setInterval(refreshAd, refreshInterval);
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [refreshCount, maxRefreshes, lastInteraction, isVisible, adSlot, refreshInterval, onRefresh]);
  
  // Intersection Observer para detectar visibilidade
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.5 }
    );
    
    if (adContainerRef.current) {
      observer.observe(adContainerRef.current);
    }
    
    return () => {
      if (adContainerRef.current) {
        observer.unobserve(adContainerRef.current);
      }
    };
  }, []);
  
  // Carregar ad inicial
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && adContainerRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('❌ Error loading initial ad:', error);
    }
  }, []);
  
  return (
    <div className={`refresh-banner-container ${className}`}>
      <div 
        ref={adContainerRef}
        className="refresh-banner-ad"
        style={{
          minHeight: '90px',
          marginBottom: '1rem',
          position: 'relative'
        }}
      >
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-5795702444937299"
          data-ad-slot={adSlot}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </div>
      
      {/* Debug info (remover em produção) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 text-center">
          Refreshes: {refreshCount}/{maxRefreshes} | 
          Próximo refresh em {Math.ceil(refreshInterval / 1000)}s
        </div>
      )}
    </div>
  );
}

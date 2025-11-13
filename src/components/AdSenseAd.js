"use client";

import { useEffect } from 'react';

/**
 * Componente reutilizável para anúncios do Google AdSense
 *
 * @param {string} adSlot - ID do slot de anúncio (ex: "1234567890")
 * @param {string} adFormat - Formato do anúncio: 'auto', 'fluid', 'rectangle', 'horizontal', 'vertical'
 * @param {boolean} fullWidthResponsive - Se o anúncio deve ser responsivo em largura total
 * @param {string} adLayout - Layout específico: 'in-article', '' (vazio para display normal)
 * @param {string} className - Classes CSS adicionais
 * @param {object} style - Estilos inline adicionais
 */
export default function AdSenseAd({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  adLayout = '',
  className = '',
  style = {}
}) {
  useEffect(() => {
    try {
      // Carrega o anúncio quando o componente monta
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5795702444937299"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
        data-ad-layout={adLayout}
      />
    </div>
  );
}

/**
 * EXEMPLOS DE USO:
 *
 * 1. Display Ad Responsivo (padrão):
 * <AdSenseAd adSlot="1234567890" />
 *
 * 2. In-Article Ad (native look):
 * <AdSenseAd
 *   adSlot="1234567890"
 *   adFormat="fluid"
 *   adLayout="in-article"
 * />
 *
 * 3. Rectangle (sidebar):
 * <AdSenseAd
 *   adSlot="1234567890"
 *   adFormat="rectangle"
 *   fullWidthResponsive={false}
 * />
 *
 * 4. Multiplex (related posts):
 * <AdSenseAd
 *   adSlot="1234567890"
 *   adFormat="autorelaxed"
 * />
 *
 * 5. Com classes customizadas:
 * <AdSenseAd
 *   adSlot="1234567890"
 *   className="my-4 hidden md:block"
 * />
 */

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const termo = searchParams.get('termo') || 'char';
  const headline = searchParams.get('headline') || 'O que é Char?';
  const copy = searchParams.get('copy') || 'Tipo de dado para caracteres';
  const cta = searchParams.get('cta') || 'APRENDA AGORA';
  const tema = searchParams.get('tema') || 'dark';
  const formato = searchParams.get('formato') || '1200x628';

  // Formatos disponíveis
  const formatos = {
    '1200x628': { width: 1200, height: 628 },
    '1080x1080': { width: 1080, height: 1080 },
    '1080x1920': { width: 1080, height: 1920 },
    '728x90': { width: 728, height: 90 },
    '300x250': { width: 300, height: 250 },
    '1200x630': { width: 1200, height: 630 }
  };

  const size = formatos[formato] || formatos['1200x628'];

  // Temas de cores
  const temas = {
    dark: {
      bg: '#000000',
      headline: '#ffffff',
      copy: '#d1d5db',
      cta: '#3b82f6',
      ctaText: '#ffffff',
      accent: '#3b82f6'
    },
    gradient: {
      bg: '#667eea',
      headline: '#ffffff',
      copy: '#f3f4f6',
      cta: '#ffffff',
      ctaText: '#667eea',
      accent: '#fbbf24'
    },
    terminal: {
      bg: '#0d1117',
      headline: '#00ff41',
      copy: '#58a6ff',
      cta: '#00ff41',
      ctaText: '#0d1117',
      accent: '#00ff41'
    },
    neon: {
      bg: '#000000',
      headline: '#ff00ff',
      copy: '#00ffff',
      cta: '#ff00ff',
      ctaText: '#000000',
      accent: '#00ffff'
    },
    light: {
      bg: '#f5f7fa',
      headline: '#1f2937',
      copy: '#4b5563',
      cta: '#2563eb',
      ctaText: '#ffffff',
      accent: '#2563eb'
    }
  };

  const colors = temas[tema] || temas.dark;

  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: colors.bg,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          height: '100%',
          width: '100%',
          padding: size.width > 800 ? '40px' : '30px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          gap: size.width > 800 ? '40px' : '30px'
        }}
      >
        {/* Header */}
        <div style={{ fontSize: size.width > 800 ? '50px' : '40px' }}>
          🔥
        </div>

        {/* Main content */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: size.width > 800 ? '20px' : '15px', flex: 1 }}>
          <div
            style={{
              fontSize: size.width > 800 ? '56px' : size.width > 400 ? '32px' : '24px',
              fontWeight: '900',
              color: colors.headline,
              lineHeight: 1.1
            }}
          >
            {headline}
          </div>

          <div
            style={{
              fontSize: size.width > 800 ? '24px' : '16px',
              color: colors.copy,
              lineHeight: 1.4
            }}
          >
            {copy}
          </div>

          <div
            style={{
              backgroundColor: colors.cta,
              color: colors.ctaText,
              padding: size.width > 800 ? '16px 32px' : '12px 24px',
              borderRadius: '8px',
              fontSize: size.width > 800 ? '22px' : '16px',
              fontWeight: '700',
              display: 'block',
              width: 'auto',
              maxWidth: '300px',
              marginTop: '10px'
            }}
          >
            {cta}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: size.width > 800 ? '18px' : '14px',
            color: colors.accent,
            fontWeight: '600'
          }}
        >
          devlingo.com.br
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

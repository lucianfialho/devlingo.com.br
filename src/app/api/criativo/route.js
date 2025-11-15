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
      bg: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
      headline: '#ffffff',
      copy: '#d1d5db',
      cta: '#3b82f6',
      ctaText: '#ffffff',
      accent: '#3b82f6'
    },
    gradient: {
      bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
      bg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      headline: '#1f2937',
      copy: '#4b5563',
      cta: '#2563eb',
      ctaText: '#ffffff',
      accent: '#2563eb'
    }
  };

  const colors = temas[tema] || temas.dark;

  // Bullets personalizados por termo
  const bullets = [
    '✓ Definição clara',
    '✓ Exemplos práticos',
    '✓ 100% em português'
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: colors.bg,
          padding: size.width > 800 ? '60px' : '30px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header com emoji */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: size.width > 800 ? '60px' : '40px' }}>🔥</div>
          <div
            style={{
              fontSize: size.width > 800 ? '24px' : '16px',
              color: colors.accent,
              fontWeight: '600',
              letterSpacing: '0.05em'
            }}
          >
            DEVLINGO
          </div>
        </div>

        {/* Conteúdo principal */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: size.width > 800 ? '30px' : '15px',
            flex: 1,
            justifyContent: 'center'
          }}
        >
          {/* Headline */}
          <div
            style={{
              fontSize: size.width > 800 ? '64px' : size.width > 400 ? '36px' : '24px',
              fontWeight: '900',
              color: colors.headline,
              lineHeight: 1.2,
              maxWidth: '90%'
            }}
          >
            {headline}
          </div>

          {/* Copy */}
          {size.height > 400 && (
            <div
              style={{
                fontSize: size.width > 800 ? '28px' : '18px',
                color: colors.copy,
                lineHeight: 1.5,
                maxWidth: '85%'
              }}
            >
              {copy}
            </div>
          )}

          {/* Bullets */}
          {size.height > 600 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginTop: '20px'
              }}
            >
              {bullets.map((bullet, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: size.width > 800 ? '24px' : '16px',
                    color: colors.copy,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {bullet}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA e URL */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: size.height > 600 ? '20px' : '10px'
          }}
        >
          {/* Botão CTA */}
          <div
            style={{
              display: 'inline-flex',
              background: colors.cta,
              color: colors.ctaText,
              padding: size.width > 800 ? '20px 40px' : '12px 24px',
              borderRadius: '12px',
              fontSize: size.width > 800 ? '28px' : '18px',
              fontWeight: '700',
              alignSelf: 'flex-start'
            }}
          >
            {cta} →
          </div>

          {/* URL */}
          <div
            style={{
              fontSize: size.width > 800 ? '20px' : '14px',
              color: colors.accent,
              fontWeight: '600'
            }}
          >
            devlingo.com.br/o-que-e/{termo.toLowerCase().replace(/\s+/g, '-')}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function CriativoGenerator() {
  const [termo, setTermo] = useState('char');
  const [template, setTemplate] = useState('educacional');
  const [formato, setFormato] = useState('1200x628');
  const [tema, setTema] = useState('dark');
  const [headline, setHeadline] = useState('O que é Char?');
  const [copy, setCopy] = useState('Tipo de dado para representar caracteres em programação.');
  const [cta, setCta] = useState('APRENDA AGORA');

  const templates = {
    educacional: {
      headline: `O que é ${termo}?`,
      copy: `Entenda ${termo} de forma simples e prática. Explicação completa em português.`,
      bullets: ['Definição clara', 'Exemplos práticos', '100% em português']
    },
    direto: {
      headline: `${termo.toUpperCase()} EM PROGRAMAÇÃO`,
      copy: 'Definição + Exemplos + Código',
      bullets: ['Glossário técnico', '15 mil termos', 'Conteúdo gratuito']
    },
    beneficio: {
      headline: `Aprenda ${termo} em 5 minutos`,
      copy: 'Do zero ao avançado de forma rápida e objetiva.',
      bullets: ['Definição clara', 'Exemplos de código', 'Todas as linguagens']
    },
    pergunta: {
      headline: `Não sabe o que é ${termo}?`,
      copy: `${termo} é essencial em programação. Aprenda agora!`,
      bullets: ['Explicação simples', 'Exemplos práticos', 'Guia completo']
    },
    problema: {
      headline: `Dúvida sobre ${termo}?`,
      copy: 'Resolva suas dúvidas de uma vez por todas.',
      bullets: ['Conteúdo didático', 'Fácil de entender', 'Grátis']
    }
  };

  const formatos = {
    '1200x628': { width: 1200, height: 628, name: 'Facebook/LinkedIn' },
    '1080x1080': { width: 1080, height: 1080, name: 'Instagram Square' },
    '1080x1920': { width: 1080, height: 1920, name: 'Instagram Story' },
    '728x90': { width: 728, height: 90, name: 'Google Display - Leaderboard' },
    '300x250': { width: 300, height: 250, name: 'Google Display - Rectangle' },
    '1200x630': { width: 1200, height: 630, name: 'Twitter/OG' }
  };

  const handleTemplateChange = (newTemplate) => {
    setTemplate(newTemplate);
    const templateData = templates[newTemplate];
    setHeadline(templateData.headline);
    setCopy(templateData.copy);
  };

  const handleDownload = async () => {
    const params = new URLSearchParams({
      termo,
      headline,
      copy,
      cta,
      template,
      formato,
      tema
    });

    window.open(`/api/criativo?${params.toString()}`, '_blank');
  };

  const currentFormat = formatos[formato];
  const scale = Math.min(600 / currentFormat.width, 400 / currentFormat.height);

  return (
    <main className="min-h-screen bg-background px-6 py-8 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🎨 Gerador de Criativos</h1>
          <p className="text-muted-foreground">
            Crie banners profissionais para Google Ads, Facebook, Instagram e mais!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configurações */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">⚙️ Configurações</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Termo */}
                <div>
                  <label className="block text-sm font-medium mb-2">Termo</label>
                  <input
                    type="text"
                    value={termo}
                    onChange={(e) => setTermo(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: char, react, python"
                  />
                </div>

                {/* Template */}
                <div>
                  <label className="block text-sm font-medium mb-2">Template</label>
                  <select
                    value={template}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="educacional">📚 Educacional</option>
                    <option value="direto">🎯 Direto ao Ponto</option>
                    <option value="beneficio">⚡ Benefício Claro</option>
                    <option value="pergunta">❓ Pergunta</option>
                    <option value="problema">🔧 Problema + Solução</option>
                  </select>
                </div>

                {/* Formato */}
                <div>
                  <label className="block text-sm font-medium mb-2">Formato</label>
                  <select
                    value={formato}
                    onChange={(e) => setFormato(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {Object.entries(formatos).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.name} ({value.width}×{value.height})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tema */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tema</label>
                  <select
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="dark">🌙 Dark (Preto)</option>
                    <option value="gradient">🌈 Gradient (Roxo/Azul)</option>
                    <option value="terminal">💻 Terminal (Code)</option>
                    <option value="neon">⚡ Neon (Cyberpunk)</option>
                    <option value="light">☀️ Light (Profissional)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Conteúdo */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">✏️ Conteúdo</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Headline */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Headline (Título principal)
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {headline.length}/50 caracteres
                  </p>
                </div>

                {/* Copy */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Copy (Texto descritivo)
                  </label>
                  <textarea
                    value={copy}
                    onChange={(e) => setCopy(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    maxLength={120}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {copy.length}/120 caracteres
                  </p>
                </div>

                {/* CTA */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    CTA (Call to Action)
                  </label>
                  <input
                    type="text"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    maxLength={25}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {cta.length}/25 caracteres
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                📥 Download PNG
              </button>
              <button
                onClick={() => {
                  // Gerar variações
                  alert('Em breve: Gerar 10 variações automaticamente!');
                }}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                🎨 Gerar Variações
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <h2 className="text-xl font-semibold">👁️ Preview</h2>
                <p className="text-sm text-muted-foreground">
                  {currentFormat.name} ({currentFormat.width}×{currentFormat.height})
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center min-h-[400px]">
                  <div
                    style={{
                      width: currentFormat.width * scale,
                      height: currentFormat.height * scale,
                      transform: `scale(${scale})`,
                      transformOrigin: 'center center'
                    }}
                  >
                    <iframe
                      src={`/api/criativo?termo=${encodeURIComponent(termo)}&headline=${encodeURIComponent(headline)}&copy=${encodeURIComponent(copy)}&cta=${encodeURIComponent(cta)}&template=${template}&formato=${formato}&tema=${tema}&preview=true`}
                      width={currentFormat.width}
                      height={currentFormat.height}
                      className="border-2 border-gray-300 rounded"
                      title="Preview"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

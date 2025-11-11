"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Share2, 
  Twitter, 
  Linkedin, 
  Facebook,
  Link2, 
  Check, 
  MessageCircle,
  Mail,
  Code2,
  Download
} from "lucide-react";

export default function ShareCard({ term, url, type = "term" }) {
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const title = term?.title || "DevLingo - Dicionário Técnico";
  const description = term?.metaDescription || "Aprenda termos técnicos em português";
  
  // Generate share texts for different platforms
  const shareTexts = {
    twitter: `🧠 ${title}\n\n${description}\n\nAprenda mais em:`,
    linkedin: `Acabei de aprender sobre ${title} no DevLingo!\n\n${description}\n\nConfira:`,
    whatsapp: `*${title}*\n\n${description}\n\nVeja mais em:`,
    telegram: `📚 ${title}\n\n${description}\n\nLeia completo:`,
    email: {
      subject: `DevLingo: ${title}`,
      body: `Olá!\n\nEncontrei esta definição interessante no DevLingo:\n\n${title}\n\n${description}\n\nVeja mais em: ${shareUrl}`
    }
  };
  
  // Embed code for developers
  const embedCode = `<!-- DevLingo Widget -->
<div data-devlingo-term="${term?.slug || ''}" 
     data-devlingo-style="card">
</div>
<script src="https://devlingo.com.br/widget.js"></script>`;
  
  // Markdown format for documentation
  const markdownCode = `## ${title}

${description}

[Leia mais no DevLingo](${shareUrl})

---
*Fonte: [DevLingo.com.br](https://devlingo.com.br)*`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    // Track event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share', {
        method: 'copy_link',
        content_type: type,
        item_id: term?.slug
      });
    }
  };
  
  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
    
    // Track event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share', {
        method: 'embed_code',
        content_type: type,
        item_id: term?.slug
      });
    }
  };
  
  const handleShare = (platform) => {
    let shareLink = '';
    
    switch(platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTexts.twitter)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(description)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareTexts.whatsapp + ' ' + shareUrl)}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTexts.telegram)}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(shareTexts.email.subject)}&body=${encodeURIComponent(shareTexts.email.body)}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'noopener,noreferrer');
      
      // Track event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
          method: platform,
          content_type: type,
          item_id: term?.slug
        });
      }
    }
  };
  
  const handleDownloadImage = async () => {
    // Generate OG image URL
    const ogImageUrl = `https://devlingo.com.br/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`;
    
    try {
      const response = await fetch(ogImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devlingo-${term?.slug || 'term'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Track event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
          method: 'download_image',
          content_type: type,
          item_id: term?.slug
        });
      }
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Compartilhar</h3>
        </div>
        
        {/* Main Share Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('twitter')}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Twitter className="w-4 h-4" />
            <span className="text-xs">Twitter</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('linkedin')}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Linkedin className="w-4 h-4" />
            <span className="text-xs">LinkedIn</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('whatsapp')}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">WhatsApp</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('telegram')}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">Telegram</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('facebook')}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Facebook className="w-4 h-4" />
            <span className="text-xs">Facebook</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('email')}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Mail className="w-4 h-4" />
            <span className="text-xs">Email</span>
          </Button>
        </div>
        
        {/* Copy Link */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                Copiado!
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                Copiar
              </>
            )}
          </Button>
        </div>
        
        {/* Developer Options */}
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground mb-3">
            🔧 Opções para Desenvolvedores
          </summary>
          
          <div className="space-y-3 mt-3">
            {/* Embed Code */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Widget HTML
              </label>
              <div className="relative">
                <pre className="p-2 bg-slate-900 text-slate-50 text-xs rounded overflow-x-auto">
                  <code>{embedCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyEmbed}
                  className="absolute top-1 right-1"
                >
                  {copiedEmbed ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Code2 className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Markdown */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Markdown
              </label>
              <div className="relative">
                <pre className="p-2 bg-slate-900 text-slate-50 text-xs rounded overflow-x-auto">
                  <code>{markdownCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(markdownCode);
                  }}
                  className="absolute top-1 right-1"
                >
                  <Code2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Download Image */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadImage}
              className="w-full flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar Card como Imagem
            </Button>
          </div>
        </details>
        
        {/* Viral Message */}
        <div className="mt-4 p-3 bg-primary/5 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            💡 Compartilhe conhecimento e ajude outros devs brasileiros!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
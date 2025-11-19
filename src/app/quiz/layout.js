import Script from "next/script";

export const metadata = {
  title: 'DevLingo Quiz - Descubra seu perfil de desenvolvedor',
  description: 'Faça o quiz e encontre vagas perfeitas para você',
};

export default function QuizLayout({ children }) {
  return (
    <>
      {/* Google Publisher Tag (GPT) - para rewarded ads */}
      <Script
        async
        src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
        strategy="beforeInteractive"
      />
      
      {/* Inicializar GPT */}
      <Script id="gpt-init" strategy="beforeInteractive">
        {`
          window.googletag = window.googletag || {cmd: []};
          googletag.cmd.push(function() {
            // Habilitar serviços
            googletag.pubads().enableSingleRequest();
            googletag.enableServices();
          });
        `}
      </Script>
      
      {/* Google AdSense - necessário para outros anúncios */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5795702444937299"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      
      {/* Renderizar children sem Header/Footer - fullscreen app experience */}
      {children}
    </>
  );
}

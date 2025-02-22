import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: `${"</lingo>"}: Expandindo Seu Vocabulário em Inglês`,
  description: `Com o ${"</lingo>"}, você tem a oportunidade de aprender uma nova palavra em inglês todos os dias de forma prática e eficaz. Ideal para quem busca melhorar seu vocabulário e se preparar para oportunidades internacionais. Explore palavras novas, suas pronúncias, significados e como aplicá-las em conversas. Torne-se mais confiante ao falar inglês e abra portas para vagas fora do país. Junte-se a nós e dê um passo importante na sua jornada de aprendizado.`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer', "GTM-WTGBRMG2");
  `,
          }}
        ></script>
      </head>
      <body className={inter.className}>
        {children}
        <Footer/>
      </body>
      
    </html>
  );
}

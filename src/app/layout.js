import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: `${"</lingo>"}: Dicionário Brasileiro de Termos Técnicos em Tecnologia`,
  description: `Glossário completo de termos técnicos em tecnologia para desenvolvedores. Definições claras e objetivas de conceitos de programação e TI em português.`,
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
        <Header />
        {children}
        <Footer/>
      </body>
      
    </html>
  );
}

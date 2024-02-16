import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "</>lingo: Expandindo Seu Vocabulário em Inglês",
  description:
    "Com o </>lingo, você tem a oportunidade de aprender uma nova palavra em inglês todos os dias de forma prática e eficaz. Ideal para quem busca melhorar seu vocabulário e se preparar para oportunidades internacionais. Explore palavras novas, suas pronúncias, significados e como aplicá-las em conversas. Torne-se mais confiante ao falar inglês e abra portas para vagas fora do país. Junte-se a nós e dê um passo importante na sua jornada de aprendizado.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

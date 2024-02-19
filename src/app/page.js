import Image from "next/image";
import NewsletterForm from "./components/NewsletterForm";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center sm:p-10 min-h-screen">
      <div className="mx-auto flex flex-col items-center max-w-screen-md sm:text-center">
        <h1 className="mb-4 text-6xl tracking-tight font-extrabold text-gray-900 sm:text-7xl dark:text-white">
          {"</lingo>"}
        </h1>
        <p className="sm:mx-auto mb-8 text-center max-w-xs sm:max-w-2xl font-light text-gray-500 md:mb-12 sm:text-xl dark:text-gray-400">
          Aprenda uma palavra por dia, aumente seu vocabulário em inglês e
          prepare-se para oportunidades de emprego fora do país.
        </p>
        <NewsletterForm />
      </div>
    </main>
  );
}

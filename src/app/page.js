import NewsletterForm from "./components/NewsletterForm";
import WordsList from "./components/WordList";
import getWords from "@/lib/getWords";

async function getData() {
  const words = await getWords();

  return words;
}

export default async function Home() {
  const words = await getData();
  return (
    <main className="bg-white dark:bg-gray-900 flex flex-col items-center justify-between min-h-screen">
      <section className="mx-auto flex flex-col items-center justify-center max-w-screen-md sm:text-center min-h-screen sm:p-10">
        <h1 className="mb-4 text-6xl tracking-tight font-extrabold text-gray-900 sm:text-7xl dark:text-white">
          {"</lingo>"}
        </h1>
        <p className="sm:mx-auto mb-8 text-center max-w-xs sm:max-w-2xl font-light text-gray-500 md:mb-12 sm:text-xl dark:text-gray-400">
          Aprenda uma palavra por dia, aumente seu vocabulário em inglês e
          prepare-se para oportunidades de emprego fora do país.
        </p>
        <NewsletterForm />
      </section>
      <section className="relative top-[-120px]  bg-gray-50 w-full p-20 flex flex-col items-center">
        <div className="max-w-screen-lg">
          <h2 className="mb-4  pb-20 text-4xl tracking-tight font-extrabold text-gray-900 sm:text-4xl ">
            Algumas palavras que já aprendemos 👇
          </h2>
        </div>
        <WordsList words={words} />
      </section>
      <footer className="text-center dark:text-gray-300 text-black p-8">
        <p>© 2024 {`</lingo>`}. Todos os direitos são reservados.</p>
      </footer>
    </main>
  );
}

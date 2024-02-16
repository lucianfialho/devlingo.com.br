import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col justify-center  p-10 min-h-screen">
      <div className="mx-auto flex flex-col items-center max-w-screen-md sm:text-center">
        <h1 className="mb-4 text-3xl tracking-tight font-extrabold text-gray-900 sm:text-7xl dark:text-white">
          {"Você vai deixar saudades 😭"}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl font-light text-gray-500 md:mb-12 sm:text-xl dark:text-gray-400">
          Você foi removido da lista para futuros e-mails do {`</>lingo`}.
          Espero que você volte um dia estaremos aqui de braços abertos. Vou
          deixar um link aqui caso voce queria voltar para a{" "}
          <Link className=" text-blue-600 underline" href={`/`}>
            página inicial.
          </Link>
        </p>
      </div>
    </main>
  );
}

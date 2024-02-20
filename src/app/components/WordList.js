function WordsList({ words }) {
  const colors = [
    {
      bg: "bg-pink-300",
      txt: "text-gray-800",
    },
    {
      bg: "bg-blue-600",
      txt: "text-gray-100",
    },
    {
      bg: "bg-purple-300",
      txt: "text-yellow-800",
    },
    {
      bg: "bg-orange-200",
      txt: "text-gray-100",
    },
    {
      bg: "bg-green-300",
      txt: "text-yellow-800",
    },
    {
      bg: "bg-yellow-300",
      txt: "text-green-800",
    },
    {
      bg: "bg-yellow-300",
      txt: "text-green-800",
    },
  ];
  return (
    <div className="flex flex-wrap justify-center items-center gap-4">
      <a className="bg-red-800 text-yellow-300 h-96 w-96 flex items-center justify-center font-bold text-5xl p-8 rounded-lg">
        {words[0].word}
      </a>
      <div className="flex max-w-sm flex-wrap gap-4 gap-y-6">
        {words.slice(1, 7).map((word, index) => (
          <a
            key={index}
            className={`${colors[index].bg} ${colors[index].txt} font-bold h-28 w-44 flex items-center justify-center p-4 rounded`}
          >
            {word.word}
          </a>
        ))}
      </div>
    </div>
  );
}

export default WordsList;

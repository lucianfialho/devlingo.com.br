import { Card, CardContent } from "@/components/ui/card";

const colors = [
  { bg: "bg-pink-300", txt: "text-gray-800" },
  { bg: "bg-blue-600", txt: "text-gray-100" },
  { bg: "bg-purple-300", txt: "text-yellow-800" },
  { bg: "bg-orange-200", txt: "text-gray-800" },
  { bg: "bg-green-300", txt: "text-yellow-800" },
  { bg: "bg-yellow-300", txt: "text-green-800" },
  { bg: "bg-red-300", txt: "text-gray-900" },
];

function WordsList({ words }) {
  if (!words || words.length === 0) return <p className="text-muted-foreground">Nenhuma palavra disponível.</p>;

  return (
    <div className="flex flex-wrap justify-center items-center gap-6">
      {/* Palavra em destaque */}
      <Card className="h-96 w-96 flex items-center justify-center bg-red-800 text-yellow-300 text-5xl font-bold p-8 rounded-xl shadow-lg">
        <CardContent className="text-center">{words[0].word}</CardContent>
      </Card>

      {/* Outras palavras */}
      <div className="flex flex-wrap justify-center gap-4">
        {words.slice(1, 7).map((word, index) => (
          <Card
            key={index}
            className={`h-28 w-44 flex items-center justify-center ${colors[index].bg} ${colors[index].txt} font-bold text-lg p-4 rounded-lg shadow`}
          >
            <CardContent className="text-center">{word.word}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default WordsList;

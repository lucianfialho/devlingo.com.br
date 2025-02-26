const { ImageResponse } = require("next/og");

export const size = {
    width: 1200,
    height: 630,
};

export const GET = async function (request, { params }) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const { searchParams } = new URL(request.url);

    // Obtém o termo da URL
    const term = searchParams.get("term") || "0";

    // Remove caracteres especiais para evitar erros na renderização
    const sanitizeText = (text) => {
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove acentos
            .replace(/[^a-zA-Z0-9\s]/g, ""); // Remove caracteres especiais
    };

    // Quantidade de foguinhos baseada no tamanho da palavra (mínimo 3, máximo 10)
    const fireCount = Math.min(Math.max(term.length / 2, 3), 10);

    // Função para gerar posições aleatórias para os foguinhos
    const getRandomPosition = () => ({
        top: `${Math.floor(Math.random() * 80) + 5}%`,
        left: `${Math.floor(Math.random() * 90) + 5}%`,
    });

    // Gera os foguinhos espalhados pela tela
    const fireEmojis = Array.from({ length: fireCount }).map((_, index) => (
        <span
            key={index}
            style={{
                position: "absolute",
                fontSize: `${Math.floor(Math.random() * 40) + 30}px`, // Tamanhos variados (30px a 70px)
                ...getRandomPosition(),
            }}
        >
            🔥
        </span>
    ));

    return new ImageResponse(
        (
            <div
                style={{
                    backgroundColor: "#000000", // Fundo preto
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    width: "100%",
                    position: "relative",
                }}
            >
                {/* Foguinhos espalhados */}
                {fireEmojis}

                {/* Nome do termo no centro */}
                <h1
                    style={{
                        fontSize: "100px",
                        fontWeight: "700",
                        color: "#FFFFFF", // Texto branco
                        textTransform: "capitalize",
                        position: "absolute",
                        zIndex: 10,
                    }}
                >
                    {sanitizeText(term)}
                </h1>
            </div>
        ),
        {
            ...size,
        }
    );
};

import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from "@/components/ui/card";
import BackButton from "@/components/BackButton";

const getData = async (letter) => {
    const response =  await fetch(`${process.env.NEXT_PUBLIC_URL}/api/v1/list/${letter}?limit=50`, {
        cache: 'force-cache',
    })
    return await response.json()
}

export default async function ListPage({ params }) {
    const {letter} = await params
    const {terms} = await getData(letter);

    return (
        <main className="flex flex-col items-center min-h-screen bg-background text-foreground px-6 mt-24">
            {/* Hero Section */}
            <Card className="max-w-3xl w-full">
                <CardHeader>
                    <h1 className="text-3xl">{`Termos com a letra ${letter}`}</h1>
                    <CardDescription className="max-w-xl">
                        <BackButton />
                    </CardDescription>
                </CardHeader>
                <CardContent> 
                    {terms.length > 0 ? (
                        <ul>
                            {terms.map((term, index) => (
                            <li className="text-xl" key={index}>
                                <Link className="underline" href={`/termos/${term.name}`}>{term.name}</Link>
                            </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Nenhum termo encontrado</p>
                    )}
                </CardContent>
            </Card>
            
        </main>
    );
}

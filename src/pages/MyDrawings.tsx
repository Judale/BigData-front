import { useEffect, useState } from "react";
import api from "../api";
import styles from "../styles/MyDrawings.module.css";

type Drawing = {
    drawing_id: number;
    round_id: number;
    game_id: number;
    word: string;
    ndjson: {
        drawing: [number[], number[]][];
    };
};

export default function MyDrawings() {
    const [drawings, setDrawings] = useState<Drawing[]>([]);
    const [selectedGameId, setSelectedGameId] = useState<number | "all">("all");
    const [selectedWord, setSelectedWord] = useState<string | "all">("all");

    useEffect(() => {
        api.get("/api/drawings/final").then((res) => {
            setDrawings(res.data.final_drawings);
        });
    }, []);

    const filteredDrawings = drawings.filter((d) => {
        const matchGame = selectedGameId === "all" || d.game_id === selectedGameId;
        const matchWord = selectedWord === "all" || d.word === selectedWord;
        return matchGame && matchWord;
    });

    return (
        <div className={styles.container}>
            <h2>Mes dessins</h2>

            <div className={styles.filters}>
                <label htmlFor="game-filter">Partie :</label>
                <select
                    id="game-filter"
                    value={selectedGameId === "all" ? "all" : String(selectedGameId)}
                    onChange={(e) =>
                        setSelectedGameId(
                            e.target.value === "all" ? "all" : parseInt(e.target.value)
                        )
                    }
                >
                    <option value="all">Toutes</option>
                    {[...new Set(drawings.map((d) => d.game_id))].map((id) => (
                        <option key={id} value={String(id)}>Partie {id}</option>
                    ))}
                </select>

                <label htmlFor="word-filter">Mot :</label>
                <select
                    id="word-filter"
                    value={selectedWord}
                    onChange={(e) => setSelectedWord(e.target.value)}
                >
                    <option value="all">Tous</option>
                    {[...new Set(drawings.map((d) => d.word))].sort().map((word) => (
                        <option key={word} value={word}>{word}</option>
                    ))}
                </select>
            </div>

            <div className={styles.grid}>
                {filteredDrawings.map((d) => (
                    <DrawingCard
                        key={d.drawing_id}
                        drawing={d.ndjson.drawing}
                        word={d.word}
                    />
                ))}
            </div>
        </div>
    );
}

function DrawingCard({ drawing, word }: { drawing: [number[], number[]][], word: string }) {
    const width = 200;
    const height = 200;

    const flatX = drawing.flatMap(([x]) => x);
    const flatY = drawing.flatMap(([, y]) => y);
    const minX = Math.min(...flatX);
    const maxX = Math.max(...flatX);
    const minY = Math.min(...flatY);
    const maxY = Math.max(...flatY);

    const scaleX = width / (maxX - minX || 1);
    const scaleY = height / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY);

    return (
        <div className={styles.card}>
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className={styles.drawing}
            >
                <rect width="100%" height="100%" fill="#fff" stroke="none" />
                {drawing.map(([x, y], i) => {
                    const d = x
                        .map((xi, idx) => {
                            const sx = (xi - minX) * scale;
                            const sy = (y[idx] - minY) * scale;
                            return `${idx === 0 ? "M" : "L"} ${sx} ${sy}`;
                        })
                        .join(" ");
                    return <path key={i} d={d} stroke="black" fill="none" strokeWidth="2" />;
                })}
            </svg>
            <p className={styles.word}>{word}</p>
        </div>
    );
}

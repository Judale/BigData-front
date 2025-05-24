import { useEffect, useState } from "react";
import axios from "../api";
import styles from "../styles/MyDrawings.module.css";

type Drawing = {
    drawing_id: number;
    round_id: number;
    ndjson: {
        drawing: [number[], number[]][];
    };
};

export default function MyDrawings() {
    const [drawings, setDrawings] = useState<Drawing[]>([]);
    const [selectedRoundId, setSelectedRoundId] = useState<number | "all">("all");

    useEffect(() => {
        axios.get("/api/drawings/final").then((res) => {
            setDrawings(res.data.final_drawings);
        });
    }, []);

    const filteredDrawings =
        selectedRoundId === "all"
            ? drawings
            : drawings.filter((d) => d.round_id === selectedRoundId);

    return (
        <div className={styles.container}>
            <h2>Mes dessins</h2>

            <div className={styles.filters}>
                <label htmlFor="round-filter">🎯 Partie :</label>
                <select
                    id="round-filter"
                    value={selectedRoundId === "all" ? "all" : String(selectedRoundId)}
                    onChange={(e) =>
                        setSelectedRoundId(e.target.value === "all" ? "all" : parseInt(e.target.value))
                    }
                >
                    <option value="all">Toutes</option>
                    {[...new Set(drawings.map((d) => d.round_id))].map((id) => (
                        <option key={id} value={String(id)}>Partie {id}</option>
                    ))}
                </select>
            </div>

            <div className={styles.grid}>
                {filteredDrawings.map((d) => (
                    <DrawingCard key={d.drawing_id} drawing={d.ndjson.drawing} />
                ))}
            </div>
        </div>
    );
}

function DrawingCard({ drawing }: { drawing: [number[], number[]][] }) {
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
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={styles.drawing}>
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
    );
}

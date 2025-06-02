import { Radar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const DIFFICULTIES = [
    { key: "easy", label: "Facile", color: "#4CAF50" },    // Vert
    { key: "medium", label: "Moyenne", color: "#FF9800" }, // Orange
    { key: "hard", label: "Difficile", color: "#F44336" }, // Rouge
];

type Props = {
    games: any[];
    valueType: "avg_score" | "avg_time_taken";
};

export default function CategoryRadarChart({ games, valueType }: Props) {
    // Récupère toutes les catégories présentes dans les parties
    const categoriesSet = new Set<string>();
    games.forEach((g) => Array.isArray(g.categories) && g.categories.forEach((cat: string) => categoriesSet.add(cat)));
    const categories = Array.from(categoriesSet);

    // Pour chaque difficulté, calcule le score moyen par catégorie
    const datasets = DIFFICULTIES.map((diff) => {
        const data = categories.map((cat) => {
            const gamesForCatDiff = games.filter(
                (g: any) =>
                    Array.isArray(g.categories) &&
                    g.categories.includes(cat) &&
                    g.difficulty === diff.key
            );
            if (!gamesForCatDiff.length) return 0;
            if (valueType === "avg_score") {
                const avg =
                    gamesForCatDiff.reduce((sum: number, g: any) => sum + g.total_points, 0) /
                    gamesForCatDiff.length;
                return Math.round(avg * 100) / 100;
            } else {
                const avg =
                    gamesForCatDiff.reduce((sum: number, g: any) => sum + (g.avg_time_taken ?? 0), 0) /
                    gamesForCatDiff.length;
                return Math.round(avg * 100) / 100;
            }
        });
        return {
            label: diff.label,
            data,
            backgroundColor: diff.color + "33",
            borderColor: diff.color,
            borderWidth: 2,
            pointBackgroundColor: diff.color,
        };
    });

    const data = {
        labels: categories,
        datasets,
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" as const },
            tooltip: { enabled: true },
        },
        scales: {
            r: {
                angleLines: { display: true },
                suggestedMin: 0,
                suggestedMax: valueType === "avg_score" ? 500 : undefined,
                pointLabels: {
                    font: { size: 16, family: "Patrick Hand, cursive" },
                },
                ticks: {
                    font: { size: 14, family: "Patrick Hand, cursive" },
                    stepSize: valueType === "avg_score" ? 50 : 1,
                },
            },
        },
    };

    return (
        <div style={{ maxWidth: 600, margin: "2rem auto" }}>
            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
                {valueType === "avg_score"
                    ? "Score moyen par catégorie et difficulté"
                    : "Rapidité moyenne (s) par catégorie et difficulté"}
            </h3>
            <Radar data={data} options={options} />
        </div>
    );
}
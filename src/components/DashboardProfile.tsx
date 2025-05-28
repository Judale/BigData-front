import React from "react";

type Game = {
    game_id: number;
    total_points: number;
    avg_detection_time?: number; // en secondes, optionnel
};

type DashboardProfileProps = {
    games: Game[];
};

function median(values: number[]) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
}

export default function DashboardProfile({ games }: DashboardProfileProps) {
    const nbGames = games.length;
    const bestScore = games.reduce((max, g) => Math.max(max, g.total_points), 0);
    const scores = games.map(g => g.total_points);
    const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const medScore = median(scores);

    // Pour le temps moyen de détection IA
    const detectionTimes = games
        .map(g => g.avg_detection_time)
        .filter((t): t is number => typeof t === "number");
    const avg_time_taken = detectionTimes.length
        ? (detectionTimes.reduce((a, b) => a + b, 0) / detectionTimes.length)
        : null;

    return (
        <div style={{ marginBottom: "2rem" }}>
            <h2>Statistiques</h2>
            <ul>
                <li>Nombre de parties jouées : <b>{nbGames}</b></li>
                <li>Meilleur score (toutes parties) : <b>{bestScore}</b></li>
                <li>Score moyen par partie : <b>{avgScore.toFixed(1)}</b></li>
                <li>Score médian par partie : <b>{medScore}</b></li>
                <li>
                    Temps moyen pour que l’IA détecte (s) :{" "}
                    <b>{avg_time_taken !== null ? avg_time_taken.toFixed(2) : "N/A"}</b>
                </li>
            </ul>
        </div>
    );
}
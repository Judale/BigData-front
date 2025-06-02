import styles from "../styles/Profile.module.css";

type DashboardProfileProps = {
    games: any[];
    avg_time_taken?: number;
    total_words?: number | null;
};

export default function DashboardProfile({
    games,
    avg_time_taken,
    total_words,
}: DashboardProfileProps) {
    const nbGames = games.length;
    const bestScore = games.reduce((max, g) => Math.max(max, g.total_points), 0);
    const scores = games.map(g => g.total_points);
    const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const sortedScores = [...scores].sort((a, b) => a - b);
    const medScore = sortedScores.length
        ? (sortedScores.length % 2 === 1
            ? sortedScores[Math.floor(sortedScores.length / 2)]
            : (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2)
        : 0;
    const lastGameId = games.length
        ? Math.max(...games.map(g => g.game_id))
        : 0;

    return (
        <div style={{ marginBottom: "2rem" }}>
            <h2>Statistiques</h2>
            <div className={styles.statsRow} style={{ justifyContent: "center" }}>
                <div className={styles.statCard}>
                    <div className="statValue">{lastGameId}</div>
                    <div className="statLabel">Parties jouées</div>
                </div>
                <div className={styles.statCard}>
                    <div className="statValue">{total_words ?? "N/A"}</div>
                    <div className="statLabel">Merveilles dessinées</div>
                </div>
                <div className={styles.statCard}>
                    <div className="statValue">{bestScore}</div>
                    <div className="statLabel">Meilleur score</div>
                </div>
                <div className={styles.statCard}>
                    <div className="statValue">{avgScore.toFixed(1)}</div>
                    <div className="statLabel">Score moyen</div>
                </div>
                <div className={styles.statCard}>
                    <div className="statValue">{medScore}</div>
                    <div className="statLabel">Score médian</div>
                </div>
                <div className={styles.statCard}>
                    <div className="statValue">{typeof avg_time_taken === "number" ? avg_time_taken.toFixed(2) : "N/A"}</div>
                    <div className="statLabel">Rapidité Moyenne (s)</div>
                </div>
            </div>
        </div>
    );
}

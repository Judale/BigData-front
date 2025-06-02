import styles from '../styles/DashboardProfile.module.css';

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
    const bestScore = games.reduce((max, g) => Math.max(max, g.total_points), 0);
    const scores = games.map((g) => g.total_points);
    const avgScore = scores.length
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
    const sortedScores = [...scores].sort((a, b) => a - b);
    const medScore = sortedScores.length
        ? sortedScores.length % 2 === 1
            ? sortedScores[Math.floor(sortedScores.length / 2)]
            : (sortedScores[sortedScores.length / 2 - 1] +
                sortedScores[sortedScores.length / 2]) /
            2
        : 0;
    const lastGameId = games.length ? Math.max(...games.map((g) => g.game_id)) : 0;

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.header}>Statistiques</h2>
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{lastGameId}</div>
                    <div className={styles.statLabel}>Parties jouées</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statValue}>{total_words ?? 'N/A'}</div>
                    <div className={styles.statLabel}>Merveilles dessinées</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statValue}>{bestScore}</div>
                    <div className={styles.statLabel}>Meilleur score</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statValue}>{avgScore.toFixed(1)}</div>
                    <div className={styles.statLabel}>Score moyen</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statValue}>{medScore}</div>
                    <div className={styles.statLabel}>Score médian</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {typeof avg_time_taken === 'number'
                            ? avg_time_taken.toFixed(2)
                            : 'N/A'}
                    </div>
                    <div className={styles.statLabel}>Rapidité moyenne (s)</div>
                </div>
            </div>
        </div>
    );
}

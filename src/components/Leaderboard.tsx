// src/components/Leaderboard.tsx
import styles from '../styles/Leaderboard.module.css';

export interface LeaderboardRow {
    username: string;
    sum_points: number;  // cumul total (pas utilisé ici pour le podium)
    max_points: number;  // meilleur score sur une partie
}

interface LeaderboardProps {
    data: LeaderboardRow[];       // tableau non trié ou trié par sum_points
    highlightUsername?: string;   // pour éventuellement surligner l’utilisateur connecté
}

export function Leaderboard({ data, highlightUsername }: LeaderboardProps) {
    // On trie d’abord localement par max_points(descendant)
    const sortedByMax = data.slice().sort((a, b) => b.max_points - a.max_points);

    // --- Séparer le podium (3 premiers) du reste (4→10) ---
    const podium = sortedByMax.slice(0, 3);
    const rest = sortedByMax.slice(3, 10);

    // Pour la barre de progression dans la liste, on prend le max de max_points parmi le podium
    const maxScore = podium.length > 0
        ? Math.max(...podium.map((r) => r.max_points))
        : 1;

    // Utilitaire pour obtenir les initiales si pas d’avatar
    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className={styles.cardContainer}>
            {/* === Podium gradient === */}
            <div className={styles.podiumWrapper}>
                {podium.map((row, idx) => {
                    // Tailles et couleurs pour 1er / 2e / 3e
                    const heights = [220, 160, 140];
                    const colors = ['#4A90E2', '#50E3C2', '#F5A623'];
                    const avatarBg = ['#357ABD', '#3FB39B', '#D38413'];
                    return (
                        <div key={row.username} className={styles.podiumItem}>
                            {/* Cercle avatar / initiales */}
                            <div
                                className={styles.avatarCircle}
                                style={{ backgroundColor: avatarBg[idx] }}
                            >
                                {getInitials(row.username)}
                            </div>
                            {/* Colonne colorée */}
                            <div
                                className={styles.podiumColumn}
                                style={{
                                    height: `${heights[idx]}px`,
                                    background: colors[idx],
                                }}
                            >
                <span className={styles.podiumScore}>
                  {row.max_points} pts
                </span>
                                <span className={styles.podiumName}>
                  {row.username}
                </span>
                            </div>
                            <span className={styles.podiumRank}>#{idx + 1}</span>
                        </div>
                    );
                })}
            </div>

            {/* === Liste rang 4 → 10 avec barre de progression === */}
            <div className={styles.listCard}>
                <h3 className={styles.listTitle}>Leaderboard</h3>
                <ul className={styles.list}>
                    {rest.map((row, idx) => {
                        // Pourcentage relatif à maxScore
                        const percent = Math.round((row.max_points / maxScore) * 100);
                        const isHighlighted = highlightUsername === row.username;
                        return (
                            <li
                                key={row.username}
                                className={`${styles.listItem} ${
                                    isHighlighted ? styles.highlighted : ''
                                }`}
                            >
                                <div className={styles.listRank}>#{idx + 4}</div>
                                <div className={styles.listUser}>{row.username}</div>
                                <div className={styles.listScore}>
                                    {row.max_points} pts
                                </div>
                                <div className={styles.progressBarBackground}>
                                    <div
                                        className={styles.progressBarFill}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

export default Leaderboard;

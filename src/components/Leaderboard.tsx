import styles from '../styles/Leaderboard.module.css';

export interface LeaderboardRow {
    username: string;
    sum_points: number; // cumul total (pour trier)
    max_points: number; // meilleur score sur une partie (pour afficher sur le podium)
}

interface LeaderboardProps {
    data: LeaderboardRow[];       // tableau déjà trié par sum_points descendant
    highlightUsername?: string;   // si on veut surligner l’utilisateur connecté
}

export function Leaderboard({ data, highlightUsername }: LeaderboardProps) {
    // --- Séparer le podium (3 premiers) du reste (4→10) ---
    const podium = data.slice(0, 3);
    const rest = data.slice(3, 10);

    // Pour la barre de progression dans la liste, on prend le meilleur max_points du podium
    const maxScore = podium.length > 0 ? Math.max(...podium.map((r) => r.max_points)) : 1;

    // Fonction utilitaire pour obtenir les initiales si on n’a pas d’avatar
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
                    // Pour 1er / 2e / 3e, on définit taille / couleur
                    const heights = [220, 160, 140];
                    const colors = ['#4A90E2', '#50E3C2', '#F5A623']; // bleu / vert / orange
                    const avatarBg = ['#357ABD', '#3FB39B', '#D38413'];
                    return (
                        <div key={row.username} className={styles.podiumItem}>
                            {/* Cercle avatar ou initiales */}
                            <div
                                className={styles.avatarCircle}
                                style={{ backgroundColor: avatarBg[idx] }}
                            >
                                {getInitials(row.username)}
                            </div>
                            {/* Bloc « colonne » colorée */}
                            <div
                                className={styles.podiumColumn}
                                style={{
                                    height: `${heights[idx]}px`,
                                    background: `linear-gradient(180deg, ${colors[idx]} 0%, ${colors[idx]}80 100%)`,
                                }}
                            >
                                <span className={styles.podiumScore}>{row.max_points} pts</span>
                                <span className={styles.podiumName}>{row.username}</span>
                            </div>
                            <span className={styles.podiumRank}>#{idx + 1}</span>
                        </div>
                    );
                })}
            </div>

            {/* === Carte blanche – liste rang 4→10 avec barres === */}
            <div className={styles.listCard}>
                <h3 className={styles.listTitle}>Leaderboard</h3>
                <ul className={styles.list}>
                    {rest.map((row, idx) => {
                        // Proportion de la barre (en pourcentage)
                        const percent = Math.round((row.max_points / maxScore) * 100);
                        const isHighlighted = highlightUsername === row.username;
                        return (
                            <li
                                key={row.username}
                                className={`${styles.listItem} ${
                                    isHighlighted ? styles.highlighted : ''
                                }`}
                            >
                                <div className={styles.listRank}>
                                    #{idx + 4}
                                </div>
                                <div className={styles.listUser}>
                                    {row.username}
                                </div>
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
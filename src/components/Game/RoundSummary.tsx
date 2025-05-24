import styles from "../../styles/Game.module.css";

type RoundScore = {
    word: string;
    score: number;
};

const gradationImages = import.meta.glob("../../assets/gradation/*.svg", {
    eager: true,
    as: "url"
}) as Record<string, string>;

const getGradationImage = (scoreRatio: number): string => {
    if (scoreRatio < 0.3) return gradationImages["../../assets/gradation/loose.svg"];
    if (scoreRatio < 0.5) return gradationImages["../../assets/gradation/bof.svg"];
    if (scoreRatio < 0.7) return gradationImages["../../assets/gradation/ok.svg"];
    if (scoreRatio < 0.9) return gradationImages["../../assets/gradation/super.svg"];
    return gradationImages["../../assets/gradation/win.svg"];
};

const getGradationLabel = (scoreRatio: number): string => {
    if (scoreRatio < 0.3) return "Un gribouillis digne d’un poulpe sous acide...";
    if (scoreRatio < 0.5) return "T’as dessiné avec les pieds ou quoi ?";
    if (scoreRatio < 0.7) return "Bon, c’est pas catastrophique… mais c’est pas du grand art non plus.";
    if (scoreRatio < 0.9) return "Pas mal ! On sent le potentiel... si tu t’appliques un jour.";
    return "Légendaire. Même Picasso pleure dans sa tombe.";
};


export default function RoundSummary({
                                         rounds,
                                         onRestart,
                                     }: {
    rounds: RoundScore[];
    onRestart: () => void;
}) {
    const total = rounds.reduce((acc, r) => acc + r.score, 0);
    const maxScore = rounds.length * 100;
    const scoreRatio = total / maxScore;
    const image = getGradationImage(scoreRatio);
    const label = getGradationLabel(scoreRatio);

    return (
        <div className={styles.leaderboard}>
            <h2>Résumé de ta partie</h2>
            <ul>
                {rounds.map((r, i) => (
                    <li key={i}>{r.word} : {r.score} pts</li>
                ))}
            </ul>
            <p>Total : {total} / {maxScore} pts</p>

            <div className={styles.gradationImageWrapper}>
                <img src={image} alt="Gradation finale" className={styles.gradationImage} />
                <p className={styles.gradationLabel}>{label}</p>
            </div>

            <button onClick={onRestart} className={styles.restartButton}>
                 Nouvelle partie
            </button>
        </div>
    );
}

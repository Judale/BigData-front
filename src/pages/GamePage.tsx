// src/pages/GamePage.tsx (ou .jsx / .tsx selon votre configuration)
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import styles from "../styles/Game.module.css";
import GameSetup from "../components/Game/GameSetup";
import DrawingCanvas from "../components/Game/DrawingCanvas";
import OverlayMessage from "../components/Game/OverlayMessage";
import RoundSummary from "../components/Game/RoundSummary";

type GamePhase = "SETUP" | "PLAYING" | "ROUND_END" | "FINISHED";

type BackendStartResponse = {
    game_id: number;
    round_id: number;
    word: string;
};

type RoundScore = {
    word: string;
    score: number;
};

const decorImages = import.meta.glob("../assets/elements/*.{svg,png}", {
    eager: true,
    as: "url"
}) as Record<string, string>;

const getDecorUrl = (name: string) => {
    const entry = Object.entries(decorImages).find(([k]) => k.includes(name));
    return entry ? entry[1] : null;
};

const decorElements = [
    { src: getDecorUrl("Start.svg"), className: styles.bgStart },
    { src: getDecorUrl("Bricks 1.svg"), className: styles.bgBricksTop },
    { src: getDecorUrl("Nuage.svg"), className: styles.bgCloud },
    { src: getDecorUrl("Bricks 3.svg"), className: styles.bgHeart },
];

/**
 * Table de correspondance anglais → français pour tous les mots
 */
const wordTranslations: Record<string, string> = {
    "airplane":    "avion",
    "angel":       "ange",
    "apple":       "pomme",
    "axe":         "hache",
    "banana":      "banane",
    "bridge":      "pont",
    "cup":         "tasse",
    "donut":       "beignet",
    "door":        "porte",
    "mountain":    "montagne",
    "bird":        "oiseau",
    "camel":       "chameau",
    "cat":         "chat",
    "cow":         "vache",
    "crab":        "crabe",
    "crocodile":   "crocodile",
    "dolphin":     "dauphin",
    "elephant":    "éléphant",
    "fish":        "poisson",
    "flamingo":    "flamant rose",
    "hedgehog":    "hérisson",
    "lion":        "lion",
    "octopus":     "pieuvre",
    "pig":         "cochon",
    "rabbit":      "lapin",
    "raccoon":     "raton laveur",
    "rhinoceros":  "rhinocéros",
    "shark":       "requin",
    "whale":       "baleine",
    "alarm clock":   "réveil",
    "anvil":         "enclume",
    "backpack":      "sac à dos",
    "baseball bat":  "batte de baseball",
    "bed":           "lit",
    "belt":          "ceinture",
    "bicycle":       "vélo",
    "cell phone":    "téléphone portable",
    "eyeglasses":    "lunettes",
    "flip flops":    "tongs",
    "flower":        "fleur",
    "fork":          "fourchette",
    "harp":          "harpe",
    "headphones":    "écouteurs",
    "hexagon":       "hexagone",
    "key":           "clé",
    "knife":         "couteau",
    "ladder":        "échelle",
    "birthday_cake": "gâteau d'anniversaire",
    "blueberry":     "myrtille",
    "bread":         "pain",
    "broccoli":      "brocoli",
    "carrot":        "carotte",
    "cookie":        "biscuit",
    "grapes":        "raisins",
    "hamburger":     "hamburger",
    "hot dog":       "hot-dog",
    "ice_cream":     "glace",
    "lollipop":      "sucette",
    "mushroom":      "champignon",
    "pear":          "poire",
    "pineapple":     "ananas",
    "pizza":         "pizza",
    "strawberry":    "fraise",
    "watermelon":    "pastèque"
};

export default function GamePage() {
    const navigate = useNavigate();
    const token   = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");

    const [phase, setPhase] = useState<GamePhase>("SETUP");
    const [game,  setGame]  = useState<BackendStartResponse | null>(null);
    const [rounds, setRounds] = useState<RoundScore[]>([]);
    const [timeLeft, setTimeLeft] = useState(30);
    const [overlayMsg, setOverlayMsg] = useState("");
    const [form, setForm] = useState({
        length: 5,
        difficulty: "easy",
        mode: "single",
        categories: [] as string[],
    });

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const canvasRef = useRef<{ getStrokes: () => any[]; clear: () => void } | null>(null);
    const roundIdxRef = useRef(0);

    const resetCanvas = () => canvasRef.current?.clear?.();

    const startNewGame = async () => {
        try {
            const { data } = await api.post<BackendStartResponse>("/api/start-game", form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            resetCanvas();
            setRounds([]);
            roundIdxRef.current = 0;
            setGame(data);
            setPhase("PLAYING");
            startTimer(data);
        } catch {
            navigate("/login");
        }
    };

    const startTimer = (g: BackendStartResponse) => {
        if (timerRef.current) clearInterval(timerRef.current);
        const start = Date.now();

        timerRef.current = setInterval(async () => {
            const elapsed = Math.floor((Date.now() - start) / 1000);
            setTimeLeft(30 - elapsed);

            const strokes = canvasRef.current?.getStrokes?.();
            if (!strokes) return;

            try {
                const { data } = await api.post("/api/submit-drawing", {
                    round_id: g.round_id,
                    ndjson: { drawing: strokes },
                    elapsed_time: elapsed,
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const finished = data.status === "recognized" || elapsed >= 30;
                if (finished) {
                    if (timerRef.current) clearInterval(timerRef.current);

                    const isRecognized = data.status === "recognized";
                    const score = isRecognized ? data.score ?? 0 : 0;
                    handleRoundEnd(isRecognized, score, g);

                    return;
                } else {
                    const motLabel = wordTranslations[data.label] ?? data.label;
                    setOverlayMsg(`Essai : ${motLabel} (${Math.round(data.proba * 100)}%)`);
                }
            } catch {
            }

        }, 2000);
    };


    const handleRoundEnd = (success: boolean, score: number, g: BackendStartResponse) => {
        setPhase("ROUND_END");
        const motAffiche = wordTranslations[g.word] ?? g.word;
        setOverlayMsg(
            success
                ? `✅ ${motAffiche} (+${score} pts)`
                : `❌ Perdu – bah alors on sait pas dessiner ?`
        );
        setRounds(prev => [...prev, { word: g.word, score }]);

        setTimeout(async () => {
            try {
                const { data } = await api.get<{ word: string | null; round_id: number }>(
                    `/api/next-word/${g.game_id}/${roundIdxRef.current}`
                );
                roundIdxRef.current += 1;

                if (data.word === null) {
                    finishGame(g.game_id);
                } else {
                    const next = { game_id: g.game_id, round_id: data.round_id, word: data.word };
                    resetCanvas();
                    setOverlayMsg("");
                    setGame(next);
                    setPhase("PLAYING");
                    startTimer(next);
                }
            } catch {}
        }, 5000);
    };

    const finishGame = async (gameId: number) => {
        try {
            const { data } = await api.post<{ total_points: number }>(
                `/api/finish-game/${gameId}`,
                null,
                { headers: { "X-User-ID": user_id } }
            );
            setOverlayMsg(`🎉 Partie terminée ! Score total : ${data.total_points}`);
            setGame(null);
            setPhase("FINISHED");
            if (timerRef.current) clearInterval(timerRef.current);
        } catch {}
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <div className={styles.container}>
            {decorElements.map((e, i) =>
                e.src ? <img key={i} src={e.src} className={e.className} alt="" /> : null
            )}

            {phase === "SETUP" && (
                <GameSetup form={form} setForm={setForm} onStart={startNewGame} />
            )}

            {(phase === "PLAYING" || phase === "ROUND_END") && game && (
                <>
                    <h1 className={styles.word}>
                        Mot : {wordTranslations[game.word] ?? game.word}
                    </h1>

                    <p className={styles.timer}>Temps restant : {timeLeft}s</p>
                    <DrawingCanvas ref={canvasRef} locked={phase !== "PLAYING"} />
                    {phase === "PLAYING" && (
                        <button onClick={resetCanvas} className={styles.clearButton}>
                            Effacer le dessin
                        </button>
                    )}
                    {overlayMsg && <OverlayMessage message={overlayMsg} />}
                </>
            )}

            {phase === "FINISHED" && (
                    <RoundSummary rounds={rounds} onRestart={() => setPhase("SETUP")} />
            )}
        </div>
    );
}

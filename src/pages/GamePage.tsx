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

export default function GamePage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");

    const [phase, setPhase] = useState<GamePhase>("SETUP");
    const [game, setGame] = useState<BackendStartResponse | null>(null);
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
                    handleRoundEnd(data.status === "recognized", data.score ?? 0, g);
                } else {
                    setOverlayMsg(`Essai : ${data.label} (${Math.round(data.proba * 100)}%)`);
                }
            } catch {}

            if (elapsed >= 30) {
                if (timerRef.current) clearInterval(timerRef.current);
                handleRoundEnd(false, 0, g);
            }
        }, 2000);
    };

    const handleRoundEnd = (success: boolean, score: number, g: BackendStartResponse) => {
        setPhase("ROUND_END");
        setOverlayMsg(success ? `✅ ${g.word} (+${score} pts)` : `❌ Perdu – c'était « ${g.word} »`);
        setRounds(prev => [...prev, { word: g.word, score }]);

        setTimeout(async () => {
            try {
                // ➜ on utilise l’index courant tel quel
                const { data } = await api.get<{ word: string | null; round_id: number }>(
                    `/api/next-word/${g.game_id}/${roundIdxRef.current}`
                );

                // ➜ puis on passe à l’index suivant
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
                    <h1 className={styles.word}>Mot: {game.word}</h1>
                    <p className={styles.timer}>Temps restant: {timeLeft}s</p>
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

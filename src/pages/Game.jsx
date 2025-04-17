import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import axios from "../api/axios";
import DrawingCanvas from "../components/DrawingCanvas";
import styles from "../styles/Game.module.css";
import BackgroundDecor from "../components/BackgroundDecor.jsx";

export default function Game() {
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [status, setStatus] = useState("");
    const [timeLeft, setTimeLeft] = useState(30);
    const [isLocked, setIsLocked] = useState(false);
    const intervalRef = useRef(null);
    const canvasRef = useRef();
    const token = localStorage.getItem("token");

    const startNewGame = () => {
        clearInterval(intervalRef.current);
        if (canvasRef.current?.clear) canvasRef.current.clear();
        setIsLocked(false);
        setStatus("");
        setTimeLeft(30);

        axios
            .post(
                "/start-game",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                setGame(res.data);
                handleTimer(res.data);
            })
            .catch(() => navigate("/login"));
    };

    const handleTimer = (gameData) => {
        const start = Date.now();
        intervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - start) / 1000);
            setTimeLeft(30 - elapsed);

            const ndjson = canvasRef.current?.getStrokes?.();
            if (!ndjson) return;

            axios
                .post(
                    "/submit-drawing",
                    {
                        game_id: gameData.game_id,
                        ndjson: { drawing: ndjson },
                        elapsed_time: elapsed,
                        is_final: elapsed >= 30,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                .then((res) => {
                    if (res.data.status === "recognized") {
                        clearInterval(intervalRef.current);
                        setStatus(
                            `Bravo ! Mot reconnu : ${res.data.label} (${res.data.score} pts)`
                        );
                        setIsLocked(true);
                    } else {
                        setStatus(
                            `Encore en cours... ${res.data.label} (${res.data.proba * 100}%)`
                        );
                    }
                });

            if (elapsed >= 30) {
                clearInterval(intervalRef.current);
                setIsLocked(true);
            }
        }, 2000);
    };

    return (
        <div className={styles.container} style={{ position: "relative" }}>
            <BackgroundDecor />
            {game && (
                <>
                    <h1 className={styles.word}>Mot à dessiner : {game.word}</h1>
                    <p className={styles.category}>Catégorie : {game.category}</p>
                    <p className={styles.timer}>Temps restant : {timeLeft}s</p>
                    <DrawingCanvas ref={canvasRef} locked={isLocked} />
                    <div className={styles.status}>{status}</div>
                </>
            )}
            <button onClick={startNewGame} className={styles.button}>
                Nouvelle partie
            </button>
        </div>

    );
}
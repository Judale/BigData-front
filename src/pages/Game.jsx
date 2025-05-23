import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import DrawingCanvas from "../components/DrawingCanvas";
import styles from "../styles/Game.module.css";
import BackgroundDecor from "../components/BackgroundDecor.jsx";

/**
 * Composant principal de la partie de dessin.
 * Version 2 : l'index de manche est conservé dans un ref (`idxRef`) afin
 * d'éviter toute capture d'état périmé dans les closures du timer.
 */
export default function Game() {
    const navigate = useNavigate();

    /* ──────────────────────── ÉTATS ──────────────────────── */
    const [game, setGame] = useState(null);          // round courant
    const [status, setStatus] = useState("");
    const [timeLeft, setTimeLeft] = useState(30);
    const [isLocked, setIsLocked] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0); // pour l'affichage uniquement
    const [rounds, setRounds] = useState([]);

    /* Références */
    const intervalRef = useRef(null);
    const canvasRef   = useRef();
    const idxRef      = useRef(0); // ↳ source de vérité pour l'index

    /* Infos auth */
    const token   = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");

    /* Formulaire */
    const [form, setForm] = useState({
        length: 5,
        difficulty: "easy",
        mode: "single",
        categories: [],
    });
    const [allCategories, setAllCategories] = useState([]);

    /* ──────────────────────── INIT ──────────────────────── */
    useEffect(() => {
        axios.get("/api/categories").then((res) => {
            setAllCategories(res.data.map(({ name }) => name));
        });
    }, []);

    // Nettoyage à la destruction
    useEffect(() => () => clearInterval(intervalRef.current), []);

    /* ──────────────────────── GESTION FORM ──────────────────────── */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCategoryToggle = (cat) => {
        setForm((prev) => {
            const selected = new Set(prev.categories);
            selected.has(cat) ? selected.delete(cat) : selected.add(cat);
            return { ...prev, categories: [...selected] };
        });
    };

    /* ──────────────────────── NOUVELLE PARTIE ──────────────────────── */
    const startNewGame = () => {
        clearInterval(intervalRef.current);
        canvasRef.current?.clear?.();

        setIsLocked(false);
        setStatus("");
        setTimeLeft(30);
        setRounds([]);

        idxRef.current = 0; // reset index source
        setCurrentIdx(0);

        axios
            .post("/api/start-game", form, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setGame(res.data);
                handleTimer(res.data);
            })
            .catch(() => navigate("/login"));
    };

    /* ──────────────────────── TIMER + POLLING ──────────────────────── */
    const handleTimer = (gameData) => {
        const startTime = Date.now();
        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            setTimeLeft(30 - elapsed);

            const ndjson = canvasRef.current?.getStrokes?.();
            if (!ndjson) return;

            axios
                .post(
                    "/api/submit-drawing",
                    {
                        round_id: gameData.round_id,
                        ndjson: { drawing: ndjson },
                        elapsed_time: elapsed,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                .then((res) => {
                    const finished = res.data.status === "recognized" || elapsed >= 30;

                    if (finished) {
                        clearInterval(intervalRef.current);
                        setIsLocked(true);

                        // Ajoute le score du round précédent
                        setRounds((prev) => [
                            ...prev,
                            { word: gameData.word, score: res.data.score ?? 0 },
                        ]);

                        /* ──────────── Index suivant ──────────── */
                        idxRef.current += 1;          // mise à jour synchrone
                        const nextIdx = idxRef.current;

                        axios
                            .get(`/api/next-word/${gameData.game_id}/${nextIdx}`)
                            .then((resp) => {
                                if (resp.data.word === null) {
                                    /* ─── Fin de partie ─── */
                                    axios
                                        .post(`/api/finish-game/${gameData.game_id}`, null, {
                                            headers: { "X-User-ID": user_id },
                                        })
                                        .then((final) => {
                                            setStatus(
                                                `🎉 Partie terminée! Score total: ${final.data.total_points}`
                                            );
                                            setGame(null);
                                        });
                                } else {
                                    /* ─── Round suivant ─── */
                                    setCurrentIdx(nextIdx); // pour l'affichage

                                    const nextGame = {
                                        game_id: gameData.game_id,
                                        round_id: resp.data.round_id,
                                        word: resp.data.word,
                                    };
                                    setGame(nextGame);

                                    // Reset UI
                                    setIsLocked(false);
                                    setTimeLeft(30);
                                    canvasRef.current?.clear?.();

                                    // Nouveau timer
                                    handleTimer(nextGame);
                                }
                            });
                    } else {
                        // Feedback live
                        setStatus(
                            `En cours... ${res.data.label} (${(res.data.proba * 100).toFixed(
                                0
                            )}%)`
                        );
                    }
                })
                .catch(() => {/* Ignore les erreurs réseau transitoires */});

            // Verrouille après 30 s si pas déjà terminé
            if (elapsed >= 30) {
                clearInterval(intervalRef.current);
                setIsLocked(true);
            }
        }, 2000);
    };

    /* ──────────────────────── RENDER ──────────────────────── */
    return (
        <div className={styles.container} style={{ position: "relative" }}>
            <BackgroundDecor />

            {/* Configuration */}
            {!game && (
                <div className={styles.config}>
                    <h2>Paramètres de la partie</h2>

                    <label>
                        Longueur&nbsp;:
                        <select name="length" value={form.length} onChange={handleChange}>
                            <option value={5}>Courte (5 mots)</option>
                            <option value={10}>Normale (10 mots)</option>
                            <option value={20}>Longue (20 mots)</option>
                        </select>
                    </label>

                    <label>
                        Difficulté&nbsp;:
                        <select name="difficulty" value={form.difficulty} onChange={handleChange}>
                            <option value="easy">Facile</option>
                            <option value="medium">Moyen</option>
                            <option value="hard">Difficile</option>
                        </select>
                    </label>

                    <label>
                        Mode&nbsp;:
                        <select name="mode" value={form.mode} onChange={handleChange}>
                            <option value="single">1 catégorie</option>
                            <option value="multi">Plusieurs</option>
                            <option value="all">Tout</option>
                            <option value="versus">Versus</option>
                        </select>
                    </label>

                    {(form.mode === "single" || form.mode === "multi") && (
                        <div>
                            <p>Catégories&nbsp;:</p>
                            {allCategories.map((cat) => (
                                <label key={cat} style={{ marginRight: 10 }}>
                                    <input
                                        type="checkbox"
                                        checked={form.categories.includes(cat)}
                                        onChange={() => handleCategoryToggle(cat)}
                                    />
                                    {cat}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Round en cours */}
            {game && (
                <>
                    <h1 className={styles.word}>Mot à dessiner: {game.word}</h1>
                    <p className={styles.timer}>Temps restant: {timeLeft}s</p>
                    <DrawingCanvas ref={canvasRef} locked={isLocked} />
                    <div className={styles.status}>{status}</div>
                </>
            )}

            {/* Leaderboard final */}
            {!game && rounds.length > 0 && (
                <div className={styles.leaderboard}>
                    <h2>🏆 Résultat de la partie</h2>
                    <ul>
                        {rounds.map((r, i) => (
                            <li key={i}>
                                {r.word}: {r.score} points
                            </li>
                        ))}
                    </ul>
                    <p>Total: {rounds.reduce((acc, r) => acc + r.score, 0)} points</p>
                </div>
            )}

            {/* Bouton principal */}
            <button onClick={startNewGame} className={styles.button}>
                Nouvelle partie
            </button>
        </div>
    );
}

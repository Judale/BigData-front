// src/pages/DrawingView.jsx
import { useState } from "react";
import axios from "axios";
import styles from "../styles/DrawingView.module.css";
import BackgroundDecor from "../components/BackgroundDecor";

export default function DrawingView() {
    const [drawingId, setDrawingId] = useState("");
    const [gameId, setGameId] = useState("");
    const [html, setHtml] = useState("");

    const handleSubmit = async () => {
        try {
            const res = await axios.post("http://127.0.0.1:5000/drawing-view", {
                ...(drawingId && { drawing_id: Number(drawingId) }),
                ...(gameId && { game_id: Number(gameId) }),
            });
            setHtml(res.data);
        } catch (err) {
            setHtml("<p style='color: red;'>Erreur lors du chargement du dessin</p>");
        }
    };

    return (
        <div className={styles.container} style={{ position: "relative" }}>
            <BackgroundDecor />
            <h2 className={styles.title}>Afficher un dessin</h2>

            <div className={styles.form}>
                <input
                    className={styles.input}
                    type="number"
                    placeholder="ID du dessin"
                    value={drawingId}
                    onChange={(e) => setDrawingId(e.target.value)}
                />
                <input
                    className={styles.input}
                    type="number"
                    placeholder="ID de la partie"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                />
                <button className={styles.button} onClick={handleSubmit}>
                    Voir
                </button>
            </div>

            <div
                className={styles.result}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    );
}

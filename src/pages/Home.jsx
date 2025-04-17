import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import BackgroundDecor from "../components/BackgroundDecor";

export default function Home() {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem("token");
        if (stored) setToken(stored);
    }, []);

    const handleStart = () => {
        if (!token) {
            navigate("/login");
        } else {
            navigate("/game");
        }
    };

    return (
        <div className={styles.homeContainer} style={{ position: "relative" }}>
            <BackgroundDecor />
            <h1 className={styles.title}>Bienvenue sur QuickDraw++</h1>
            <p className={styles.description}>
                Dessinez en temps réel pendant que notre modèle tente de deviner ce que vous tracez ! Un Pictionary nouvelle génération avec scoring, profils et data-viz.
            </p>
            <button onClick={handleStart} className={styles.ctaButton}>
                Commencer une partie
            </button>
        </div>
    );
}
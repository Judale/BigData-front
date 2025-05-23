// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/Profile.module.css";
import BackgroundDecor from "../components/BackgroundDecor";
import api from "../api/axios";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Non connecté. Veuillez vous connecter pour voir votre profil.");
            return;
        }

        api
            .get("/api/profile/me", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setProfile(res.data))
            .catch(() => setError("Erreur lors du chargement du profil"));
    }, []);

    if (error) {
        return <div className="p-6 text-red-600 text-center">{error}</div>;
    }

    if (!profile) {
        return <div className="p-6 text-center">Chargement du profil...</div>;
    }

    return (
        <div className={styles.container} style={{ position: "relative" }}>
            <BackgroundDecor />
            <h2 className={styles.title}>Mon profil</h2>

            <div className={styles.summary}>
                <p><strong>Total de parties :</strong> {profile.total_games}</p>
                <p><strong>Score total :</strong> {profile.total_score}</p>
                <p><strong>Meilleur score :</strong> {profile.best_score}</p>
            </div>

            <h3 className={styles.subtitle}>Mes parties</h3>
            <div className={styles.gamesGrid}>
                {profile.games.map((game) => (
                    <div key={game.game_id} className={styles.gameCard}>
                        <p><strong>Mot :</strong> {game.word}</p>
                        <p><strong>Catégorie :</strong> {game.category}</p>
                        <p><strong>Score :</strong> {game.score ?? "Non terminé"}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

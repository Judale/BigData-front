import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Profile.module.css';

export default function Profile() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<null | any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/profile/me');
                setProfile(res.data);
            } catch (err) {
                logout();
                navigate('/login');
            }
        };

        fetchProfile();
    }, []);

    if (!profile) return <p className={styles.container}>Chargement...</p>;

    return (
        <div className={styles.container}>
            <div className={styles.information}>
                <div className={styles.utilisateur}>
                    <h2>Mon profil</h2>
                    <p>Nombre de parties : {profile.total_games}</p>
                    <p>Score total : {profile.total_score}</p>
                    <p>Meilleur score : {profile.best_score}</p>
                </div>
                <button className={styles.ProfileButton} onClick={() => { logout(); navigate('/login'); }}>
                    Se déconnecter
                </button>
            </div>

            <h3>Parties récentes :</h3>
            <ul>
                {profile.games.map((g: any, i: number) => (
                    <li key={`${g.game_id}-${i}`}>
                        Partie #{g.game_id} – Score : {g.total_points}
                    </li>
                ))}
            </ul>


        </div>
    );
}

import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Profile.module.css';
import DashboardProfile from '../components/DashboardProfile';

export default function Profile() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<null | any>(null);
    const [showPwdForm, setShowPwdForm] = useState(false);
    const [oldPwd, setOldPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [msg, setMsg] = useState('');
    const [category, setCategory] = useState('all');
    const [difficulty, setDifficulty] = useState('all');
    const [period, setPeriod] = useState('alltime');

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

    const handlePwdChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg('');
        try {
            await api.post('/api/change-password', {
                old_password: oldPwd,
                new_password: newPwd,
            });
            setMsg('Mot de passe modifié avec succès.');
            setShowPwdForm(false);
            setOldPwd('');
            setNewPwd('');
        } catch (err: any) {
            setMsg(
                err?.response?.data?.error ||
                'Erreur lors du changement de mot de passe.'
            );
        }
    };

    if (!profile) return <p className={styles.container}>Chargement...</p>;

    return (
        <div className={styles.container}>
            <div className={styles.information}>
                <div className={styles.utilisateur}>
                    <h2>Mon profil</h2>
                    <p>Nom d'utilisateur : {profile.username}</p>
                    <button
                        className={styles.ProfileButton}
                        onClick={() => setShowPwdForm(!showPwdForm)}
                    >
                        Modifier le mot de passe
                    </button>
                    {showPwdForm && (
                        <form onSubmit={handlePwdChange} className={styles.pwdForm}>
                            <input
                                type="password"
                                placeholder="Ancien mot de passe"
                                value={oldPwd}
                                onChange={e => setOldPwd(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Nouveau mot de passe"
                                value={newPwd}
                                onChange={e => setNewPwd(e.target.value)}
                                required
                            />
                            <button type="submit">Valider</button>
                        </form>
                    )}
                    {msg && <p>{msg}</p>}
                </div>
                <button className={styles.ProfileButton} onClick={() => { logout(); navigate('/login'); }}>
                    Se déconnecter
                </button>
            </div>

            <DashboardProfile games={profile.games} />

            {/* Filtres sous Statistiques */}
            <div className={styles.filtresContainer}>
                <div className={styles.filtreBloc}>
                    <label>Catégorie&nbsp;:</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="all">Toutes</option>
                        <option value="Animaux">Animaux</option>
                        <option value="Nourriture">Nourriture</option>
                        <option value="Objet">Objet</option>
                        <option value="Test">Test</option>
                    </select>
                </div>
                <div className={styles.filtreBloc}>
                    <label>Difficulté&nbsp;:</label>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                        <option value="all">Toutes</option>
                        <option value="easy">Facile</option>
                        <option value="medium">Moyenne</option>
                        <option value="hard">Difficile</option>
                    </select>
                </div>
                <div className={styles.filtreBloc}>
                    <label>Période&nbsp;:</label>
                    <select value={period} onChange={e => setPeriod(e.target.value)}>
                        <option value="alltime">Tout le temps</option>
                        <option value="day">Dernier jour</option>
                        <option value="week">Semaine</option>
                        <option value="month">Mois</option>
                    </select>
                </div>
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

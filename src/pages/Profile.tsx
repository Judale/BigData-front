import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Profile.module.css';
import DashboardProfile from '../components/DashboardProfile';
import ScoreLineChart from '../components/ScoreLineChart';

export default function Profile() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<null | any>(null);
    const [showPwdForm, setShowPwdForm] = useState(false);
    const [oldPwd, setOldPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [msg, setMsg] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('all');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/profile/stats');
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

    const filteredGames = profile.games.filter((g: any) => {
        const difficultyOk = difficultyFilter === 'all' || g.difficulty === difficultyFilter;
        const categoryOk =
            categoryFilter === 'all' ||
            (Array.isArray(g.categories) && g.categories.includes(categoryFilter));

        let periodOk = true;
        if (periodFilter !== 'all') {
            const finishedAt = new Date(g.finished_at);
            const now = new Date();
            if (periodFilter === 'yesterday') {
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                periodOk =
                    finishedAt.getDate() === yesterday.getDate() &&
                    finishedAt.getMonth() === yesterday.getMonth() &&
                    finishedAt.getFullYear() === yesterday.getFullYear();
            } else if (periodFilter === 'week') {
                const weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                periodOk = finishedAt >= weekAgo && finishedAt <= now;
            } else if (periodFilter === 'month') {
                const monthAgo = new Date(now);
                monthAgo.setMonth(now.getMonth() - 1);
                periodOk = finishedAt >= monthAgo && finishedAt <= now;
            }
        }

        return difficultyOk && categoryOk && periodOk;
    });

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

            <DashboardProfile
                games={profile.games}
                avg_time_taken={profile.avg_time_taken}
                total_words={profile.total_words}
            />

            <div className={styles.filtresContainer}>
                <div className={styles.filtreBloc}>
                    <label>Difficulté :</label>
                    <select
                        value={difficultyFilter}
                        onChange={e => setDifficultyFilter(e.target.value)}
                    >
                        <option value="all">Toutes</option>
                        <option value="easy">Facile</option>
                        <option value="medium">Moyenne</option>
                        <option value="hard">Difficile</option>
                    </select>
                </div>
                <div className={styles.filtreBloc}>
                    <label>Catégorie :</label>
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">Toutes</option>
                        <option value="Animaux">Animaux</option>
                        <option value="Test">Test</option>
                        <option value="Nourriture">Nourriture</option>
                        <option value="Objet">Objet</option>
                    </select>
                </div>
                <div className={styles.filtreBloc}>
                    <label>Période :</label>
                    <select
                        value={periodFilter}
                        onChange={e => setPeriodFilter(e.target.value)}
                    >
                        <option value="all">Toutes</option>
                        <option value="yesterday">Hier</option>
                        <option value="week">Dans la semaine</option>
                        <option value="month">Dans le mois</option>
                    </select>
                </div>
            </div>

            <ScoreLineChart games={filteredGames} />

            <h3>Top 5 : Tes chefs-d'œuvre</h3>
            <ul>
                {profile.top_words && profile.top_words.map((w: any, i: number) => (
                    <li key={w.word}>
                        {i + 1}. <b>{w.word}</b> — Score moyen : {w.avg_score_per_drawing}
                    </li>
                ))}
            </ul>

            <h3>Top 5 : Il faut s'entraîner !</h3>
            <ul>
                {profile.flop_words && profile.flop_words.map((w: any, i: number) => (
                    <li key={w.word}>
                        {i + 1}. <b>{w.word}</b> — Score moyen : {w.avg_score_per_drawing}
                    </li>
                ))}
            </ul>

            <h3>Parties récentes :</h3>
            <ul>
                {filteredGames.map((g: any, i: number) => (
                    <li key={`${g.game_id}-${i}`}>
                        Partie #{g.game_id} – Score : {g.total_points}
                    </li>
                ))}
            </ul>
        </div>
    );
}

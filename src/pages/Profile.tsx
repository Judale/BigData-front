import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Profile.module.css';
import DashboardProfile from '../components/DashboardProfile';
import ScoreLineChart from '../components/ScoreLineChart';
import CategoryRadarChart from '../components/CategoryRadarChart';

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
    const [durationFilter, setDurationFilter] = useState('all');
    const [radarValueType, setRadarValueType] = useState<'avg_score' | 'avg_time_taken'>('avg_score');

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

    if (!profile) {
        return <p className={styles.loadingText}>Chargement...</p>;
    }

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

    const filteredGamesForChart = filteredGames.filter((g: any) =>
        durationFilter === 'all' ? true : g.duration === durationFilter
    );

    return (
        <div className={styles.container}>
            {/* Section "Mon profil" */}
            <div className={styles.information}>
                <div className={styles.utilisateur}>
                    <h2 className={styles.title}>Mon profil</h2>
                    <p className={styles.greeting}>
                        Salut <span className={styles.username}><strong>{profile.username}</strong></span> ! 👋 Bienvenue dans ta section !
                    </p>
                    <button
                        className={styles.ProfileButton}
                        onClick={() => setShowPwdForm(!showPwdForm)}
                    >
                        Modifier le mot de passe
                    </button>
                    {showPwdForm && (
                        <form onSubmit={handlePwdChange} className={styles.pwdForm}>
                            <input
                                className={styles.pwdInput}
                                type="password"
                                placeholder="Ancien mot de passe"
                                value={oldPwd}
                                onChange={(e) => setOldPwd(e.target.value)}
                                required
                            />
                            <input
                                className={styles.pwdInput}
                                type="password"
                                placeholder="Nouveau mot de passe"
                                value={newPwd}
                                onChange={(e) => setNewPwd(e.target.value)}
                                required
                            />
                            <button type="submit" className={styles.pwdSubmit}>
                                Valider
                            </button>
                        </form>
                    )}
                    {msg && <p className={styles.msg}>{msg}</p>}
                </div>
                <button
                    className={styles.ProfileButton}
                    onClick={() => {
                        logout();
                        navigate('/login');
                    }}
                >
                    Se déconnecter
                </button>
            </div>

            {/* Statistiques générales */}
            <DashboardProfile
                games={profile.games}
                avg_time_taken={profile.avg_time_taken}
                total_words={profile.total_words}
            />

            {/* Filtres */}
            <div className={styles.filtresContainer}>
                <div className={styles.filtreBloc}>
                    <label htmlFor="difficulty">Difficulté :</label>
                    <select
                        id="difficulty"
                        className={styles.select1}
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                    >
                        <option value="all">Toutes</option>
                        <option value="easy">Facile</option>
                        <option value="medium">Moyenne</option>
                        <option value="hard">Difficile</option>
                    </select>
                </div>

                <div className={styles.filtreBloc}>
                    <label htmlFor="category">Catégorie :</label>
                    <select
                        id="category"
                        className={styles.select2}
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">Toutes</option>
                        <option value="Animaux">Animaux</option>
                        <option value="Test">Test</option>
                        <option value="Nourriture">Nourriture</option>
                        <option value="Objet">Objet</option>
                    </select>
                </div>

                <div className={styles.filtreBloc}>
                    <label htmlFor="period">Période :</label>
                    <select
                        id="period"
                        className={styles.select3}
                        value={periodFilter}
                        onChange={(e) => setPeriodFilter(e.target.value)}
                    >
                        <option value="all">Toutes</option>
                        <option value="yesterday">Hier</option>
                        <option value="week">Dans la semaine</option>
                        <option value="month">Dans le mois</option>
                    </select>
                </div>

                <div className={styles.filtreBloc}>
                    <label htmlFor="duration">Durée :</label>
                    <select
                        id="duration"
                        className={styles.select4}
                        value={durationFilter}
                        onChange={(e) => setDurationFilter(e.target.value)}
                    >
                        <option value="all">Toutes</option>
                        <option value="short">Courte (5 dessins)</option>
                        <option value="medium">Moyenne (10 dessins)</option>
                        <option value="long">Longue (15 dessins)</option>
                    </select>
                </div>
            </div>

            {/* Graphique en ligne (score par partie) */}
            <ScoreLineChart games={filteredGamesForChart} />

            {/* Section Radar + contrôle */}
            <div className={styles.radarSection}>
                <div className={styles.radarWrapper}>
                    <CategoryRadarChart
                        games={profile.games}
                        valueType={radarValueType}
                    />
                </div>

                <div className={styles.radarControl}>
                    <label htmlFor="radarValue" className={styles.radarLabel}>
                        Valeur du radar :
                    </label>
                    <select
                        id="radarValue"
                        className={styles.select1}
                        value={radarValueType}
                        onChange={(e) =>
                            setRadarValueType(e.target.value as 'avg_score' | 'avg_time_taken')
                        }
                    >
                        <option value="avg_score">Score moyen</option>
                        <option value="avg_time_taken">Rapidité moyenne (s)</option>
                    </select>
                </div>
            </div>

            {/* Top 5 / Flop 5 mots */}
            <div className={styles.topWordsContainer}>
                <div className={styles.topWordsCard}>
                    <h3 className={styles.topWordsTitle}>Top 5 : Tes chefs‐d'œuvre</h3>
                    <div className={styles.wordsListTop}>
                        {profile.top_words?.map((w: any, i: number) => (
                            <div key={w.word} className={styles.wordsItem}>
                                <span className={styles.wordsRank}>{i + 1}</span>
                                <span className={styles.wordsWord}>{w.word}</span>
                                <span className={styles.wordsScore}>{w.avg_score_per_drawing}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.topWordsCard}>
                    <h3 className={styles.flopWordsTitle}>Flop 5 : Il faut s'entraîner !</h3>
                    <div className={styles.wordsListFlop}>
                        {profile.flop_words?.map((w: any, i: number) => (
                            <div key={w.word} className={styles.wordsItem}>
                                <span className={styles.wordsRank}>{i + 1}</span>
                                <span className={styles.wordsWord}>{w.word}</span>
                                <span className={styles.wordsScore}>{w.avg_score_per_drawing}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

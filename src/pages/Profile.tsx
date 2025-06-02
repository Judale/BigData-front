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

    const filteredGamesForChart = filteredGames.filter((g: any) =>
        durationFilter === 'all' || g.duration === durationFilter
    );

    return (
        <div className={styles.container}>
            <div className={styles.information}>
                <div className={styles.utilisateur}>
                    <h2>Mon profil</h2>
                    <p style={{ fontSize: "1.2rem", fontWeight: 500 }}>
                    Salut {profile.username} ! 👋 Bienvenue dans ta section !
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
                <div className={styles.filtreBloc}>
                    <label>Durée :</label>
                    <select
                        value={durationFilter}
                        onChange={e => setDurationFilter(e.target.value)}
                    >
                        <option value="all">Toutes</option>
                        <option value="short">Courte (5 dessins)</option>
                        <option value="medium">Moyenne (10 dessins)</option>
                        <option value="long">Longue (15 dessins)</option>
                    </select>
                </div>
            </div>

            <ScoreLineChart games={filteredGamesForChart} />

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ flex: 1, maxWidth: 600 }}>
                    <CategoryRadarChart
                        games={profile.games}
                        valueType={radarValueType}
                    />
                </div>
                <div style={{ marginLeft: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <label style={{ marginBottom: 8, fontWeight: 'bold', color: '#B561EC' }}>Valeur du radar :</label>
                    <select
                        value={radarValueType}
                        onChange={e => setRadarValueType(e.target.value as 'avg_score' | 'avg_time_taken')}
                        style={{
                            fontFamily: '"Patrick Hand", cursive',
                            fontSize: '1.1rem',
                            border: '2px solid #FB8CA1',
                            borderRadius: 10,
                            padding: '0.5rem 1rem',
                            minWidth: 180
                        }}
                    >
                        <option value="avg_score">Score moyen</option>
                        <option value="avg_time_taken">Rapidité moyenne (s)</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', margin: '2rem 0' }}>
                <div style={{
                    background: '#F7F7F7',
                    borderRadius: 16,
                    boxShadow: '2px 2px 8px #e0e0e0',
                    padding: '1.5rem 2rem',
                    minWidth: 260,
                    flex: 1,
                    maxWidth: 350
                }}>
                    <h3 style={{ color: '#4CAF50', textAlign: 'center', marginBottom: 16 }}>🏆 Top 5 : Tes chefs-d'œuvre</h3>
                    {profile.top_words && profile.top_words.map((w: any, i: number) => (
                        <div key={w.word} style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: 12,
                            background: '#ABE6D0',
                            borderRadius: 10,
                            padding: '0.7rem 1rem'
                        }}>
                            <span style={{
                                fontWeight: 'bold',
                                fontSize: 22,
                                color: '#B561EC',
                                marginRight: 12,
                                width: 28,
                                textAlign: 'center'
                            }}>{i + 1}</span>
                            <span style={{ flex: 1, fontWeight: 500, fontSize: 18 }}>{w.word}</span>
                            <span style={{
                                background: '#fff',
                                borderRadius: 8,
                                padding: '0.2rem 0.7rem',
                                fontWeight: 600,
                                color: '#4CAF50',
                                fontSize: 16,
                                marginLeft: 10
                            }}>
                                {w.avg_score_per_drawing}
                            </span>
                        </div>
                    ))}
                </div>
                <div style={{
                    background: '#F7F7F7',
                    borderRadius: 16,
                    boxShadow: '2px 2px 8px #e0e0e0',
                    padding: '1.5rem 2rem',
                    minWidth: 260,
                    flex: 1,
                    maxWidth: 350
                }}>
                    <h3 style={{ color: '#F44336', textAlign: 'center', marginBottom: 16 }}>🤢 Top 5 : Il faut s'entraîner !</h3>
                    {profile.flop_words && profile.flop_words.map((w: any, i: number) => (
                        <div key={w.word} style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: 12,
                            background: '#FB8CA1',
                            borderRadius: 10,
                            padding: '0.7rem 1rem'
                        }}>
                            <span style={{
                                fontWeight: 'bold',
                                fontSize: 22,
                                color: '#F44336',
                                marginRight: 12,
                                width: 28,
                                textAlign: 'center'
                            }}>{i + 1}</span>
                            <span style={{ flex: 1, fontWeight: 500, fontSize: 18 }}>{w.word}</span>
                            <span style={{
                                background: '#fff',
                                borderRadius: 8,
                                padding: '0.2rem 0.7rem',
                                fontWeight: 600,
                                color: '#F44336',
                                fontSize: 16,
                                marginLeft: 10
                            }}>
                                {w.avg_score_per_drawing}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

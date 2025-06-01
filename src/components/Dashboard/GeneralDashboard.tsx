// src/components/Dashboard/GeneralDashboard.tsx
import React, { useEffect, useState } from 'react';
import api from '../../api';               // ← ton instance Axios
import { ChartXKCD } from '../ChartXKCD';  // Seul le composant ChartXKCD est importé

// Typages pour tes données
type Difficulty = 'easy' | 'medium' | 'hard';

interface LeaderboardEntry {
    username: string;
    total_points: number;
}

interface GeneralStats {
    leaderboard: LeaderboardEntry[];
    difficulties: Difficulty[];
    avg_points_per_drawing: number;
    avg_points_per_category: Record<string, number>;
}

export const GeneralDashboard: React.FC = () => {
    // États initiaux : tout à une valeur “non undefined”
    const [stats, setStats] = useState<GeneralStats>({
        leaderboard: [],
        difficulties: [],
        avg_points_per_drawing: 0,
        avg_points_per_category: {}
    });
    const [user, setUser] = useState<string | null>(null);
    const [selectedDiff, setSelectedDiff] = useState<Difficulty | ''>('');

    // 1) Récupérer le profil (pour afficher le rang personnel)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/api/profile/me')
                .then(res => setUser(res.data.username))
                .catch(() => setUser(null));
        }
    }, []);

    // 2) Récupérer les stats générales du back
    useEffect(() => {
        api.get<GeneralStats>('/api/general-stats')
            .then(res => {
                const data = res.data;
                setStats({
                    leaderboard: Array.isArray(data.leaderboard) ? data.leaderboard : [],
                    difficulties: Array.isArray(data.difficulties) ? data.difficulties : [],
                    avg_points_per_drawing: data.avg_points_per_drawing ?? 0,
                    avg_points_per_category: data.avg_points_per_category ?? {}
                });
                if (Array.isArray(data.difficulties) && data.difficulties.length > 0) {
                    setSelectedDiff(data.difficulties[0]);
                }
            })
            .catch(err => {
                console.error('Erreur lors du fetch /api/general-stats:', err);
            });
    }, []);

    // 3) Préparer le top 10 (board)
    const board: LeaderboardEntry[] = Array.isArray(stats.leaderboard)
        ? stats.leaderboard
            // Tu peux filtrer par difficulté ici si ton API renvoie un champ difficulty pour chaque entrée
            //.filter(entry => entry.difficulty === selectedDiff)
            .slice(0, 10)
        : [];

    // 4) Config du chart Leaderboard
    const leaderboardConfig = {
        title: 'Leaderboard (Top 10)',
        data: {
            labels: board.map(u => u.username),
            values: board.map(u => u.total_points)
        },
        roughness: 2,
        fillStyle: 'cross-hatch',
        strokeWidth: 2,
        fontFamily: 'Patrick Hand'
    };

    // 5) Config du chart Moyenne par Catégorie
    const avgCat = stats.avg_points_per_category || {};
    const categoryConfig = {
        title: 'Moyenne par catégorie',
        data: {
            labels: Object.keys(avgCat),
            values: Object.values(avgCat)
        },
        roughness: 2,
        fillStyle: 'zigzag',
        strokeWidth: 2,
        fontFamily: 'Patrick Hand'
    };

    return (
        <section style={{ width: '80%', maxWidth: 800, margin: '2rem auto', zIndex: 2 }}>
            <h2 style={{ fontFamily: 'Patrick Hand', textAlign: 'center' }}>Côté Général</h2>

            {/* Filtre de difficulté */}
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                <label style={{ fontFamily: 'Patrick Hand' }}>
                    Filtrer par difficulté :
                    <select
                        value={selectedDiff}
                        onChange={e => setSelectedDiff(e.target.value as Difficulty)}
                        style={{ marginLeft: '0.5rem', fontFamily: 'Patrick Hand' }}
                    >
                        <option value="" disabled>– choisissez –</option>
                        {stats.difficulties.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </label>
            </div>

            {/* Indicateur de classement personnel */}
            {user && board.length > 0 && (() => {
                const rankIndex = board.findIndex(u => u.username === user);
                return rankIndex >= 0
                    ? <p style={{ fontFamily: 'Patrick Hand', textAlign: 'center' }}>
                        Vous êtes classé #{rankIndex + 1}
                    </p>
                    : null;
            })()}

            {/* Leaderboard Top 10 */}
            {board.length > 0 ? (
                <div style={{ width: '100%', maxWidth: 700, margin: '1rem auto' }}>
                    <ChartXKCD
                        type="Bar"
                        width={700}
                        height={350}
                        config={leaderboardConfig}
                    />
                </div>
            ) : (
                <p style={{ textAlign: 'center', fontStyle: 'italic' }}>Chargement du leaderboard…</p>
            )}

            {/* Moyenne de points par dessin */}
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <h3 style={{ fontFamily: 'Patrick Hand' }}>🏅 Moyenne de points par dessin</h3>
                <div style={{ fontSize: '2rem', fontFamily: 'Patrick Hand' }}>
                    {stats.avg_points_per_drawing}
                </div>
            </div>

            {/* Moyenne par catégorie */}
            {Object.keys(avgCat).length > 0 ? (
                <div style={{ width: '100%', maxWidth: 700, margin: '1rem auto' }}>
                    <ChartXKCD
                        type="Bar"
                        width={700}
                        height={350}
                        config={categoryConfig}
                    />
                </div>
            ) : (
                <p style={{ textAlign: 'center', fontStyle: 'italic' }}>Chargement des moyennes par catégorie…</p>
            )}
        </section>
    );
};
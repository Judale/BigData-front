import { useEffect, useState } from 'react';
import { ChartXKCD } from './ChartXKCD';
import { Leaderboard } from './Leaderboard';
import styles from '../styles/HomeDashboard.module.css';
import api from '../api';

interface LeaderboardEntry {
    username: string;
    sum_points: number;
    max_points: number;
}

interface GeneralStats {
    leaderboard: LeaderboardEntry[];
    avg_points_per_drawing: number;
    avg_points_per_category: Record<string, number>;
    games_per_category: Record<string, number>;
}

interface Props {
    dashboardRef: React.RefObject<HTMLDivElement | null>;
    visible: boolean;
}

export default function HomeDashboard({ dashboardRef, visible }: Props) {
    const [stats, setStats] = useState<GeneralStats>({
        leaderboard: [],
        avg_points_per_drawing: 0,
        avg_points_per_category: {},
        games_per_category: {},
    });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        api
            .get<GeneralStats>('/api/general-stats')
            .then((res) => {
                const data = res.data;
                setStats({
                    leaderboard: Array.isArray(data.leaderboard) ? data.leaderboard : [],
                    avg_points_per_drawing: data.avg_points_per_drawing ?? 0,
                    avg_points_per_category: data.avg_points_per_category ?? {},
                    games_per_category: data.games_per_category ?? {},
                });
            })
            .catch((err) => {
                console.error('Erreur fetch /api/general-stats:', err);
            })
            .finally(() => {
                setLoadingStats(false);
            });
    }, []);

    // Tri décroissant du leaderboard
    const sortedBoard = [...stats.leaderboard].sort((a, b) => b.sum_points - a.sum_points);

    // Préparation des couleurs par catégorie
    const categoryKeys = Object.keys(stats.avg_points_per_category);
    const palette = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    const COLORS: Record<string, string> = {};
    categoryKeys.forEach((cat, idx) => {
        COLORS[cat] = palette[idx % palette.length];
    });

    // Config du bar chart (moyenne par catégorie)
    const categoryConfig = {
        title: 'Moyenne par catégorie',
        data: {
            labels: categoryKeys,
            datasets: [
                {
                    label: 'Moyenne des points',
                    data: categoryKeys.map((c) => stats.avg_points_per_category[c]),
                    backgroundColor: categoryKeys.map((c) => COLORS[c]),
                },
            ],
        },
        roughness: 2,
        strokeWidth: 2,
        fontFamily: 'Patrick Hand',
    };

    // Config du pie chart (répartition des parties)
    const pieConfig = {
        title: 'Répartition des parties par catégorie',
        data: {
            labels: Object.keys(stats.games_per_category),
            datasets: [
                {
                    label: 'Nombre de parties',
                    data: Object.keys(stats.games_per_category).map((c) => stats.games_per_category[c]),
                    backgroundColor: Object.keys(stats.games_per_category).map((c) => COLORS[c] || '#ccc'),
                },
            ],
        },
        roughness: 2,
        strokeWidth: 2,
        fontFamily: 'Patrick Hand',
    };

    // Config du line chart (cumul des points du Top 10)
    const lineConfig = {
        title: 'Cumul de points du Top 10',
        data: {
            labels: sortedBoard.slice(0, 10).map((_, idx) => `#${idx + 1}`),
            datasets: [
                {
                    label: 'Cumul des points',
                    data: sortedBoard.slice(0, 10).map((u) => u.sum_points),
                    strokeColor: '#36A2EB',
                },
            ],
        },
        options: {
            showLegend: false,
        },
        roughness: 2,
        strokeWidth: 2,
        fontFamily: 'Patrick Hand',
    };

    const hasCategories = categoryKeys.length > 0;
    const hasGamesData = Object.keys(stats.games_per_category).length > 0;
    const hasLeaderboard = sortedBoard.length > 0;

    return (
        <div
            ref={dashboardRef}
            className={`${styles.dashboardWrapper} ${visible ? styles.dashboardVisible : ''}`}
        >
            <section className={styles.dashboardSection}>
                {/* COLONNE GAUCHE */}
                <div className={styles.chartsWrapper}>
                    {/* BAR CHART (Moyenne par catégorie) */}
                    <div className={styles.barChart}>
                        {loadingStats ? (
                            <p className={styles.loadingText}>Chargement des moyennes par catégorie …</p>
                        ) : hasCategories ? (
                            <ChartXKCD type="Bar" config={categoryConfig} />
                        ) : (
                            <p className={styles.loadingText}>Aucune catégorie disponible.</p>
                        )}
                    </div>

                    {/* PIE CHART (Répartition des parties) */}
                    <div className={styles.pieChart}>
                        {loadingStats ? (
                            <p className={styles.loadingText}>Chargement du camembert …</p>
                        ) : hasGamesData ? (
                            <ChartXKCD type="Pie" config={pieConfig} />
                        ) : (
                            <p className={styles.loadingText}>Pas de données pour le camembert.</p>
                        )}
                    </div>

                    {/* LINE CHART (Cumul de points) */}
                    <div className={styles.lineChart}>
                        {loadingStats ? (
                            <p className={styles.loadingText}>Chargement du graphique linéaire …</p>
                        ) : hasLeaderboard ? (
                            <ChartXKCD type="Line" config={lineConfig} />
                        ) : (
                            <p className={styles.loadingText}>Leaderboard vide.</p>
                        )}
                    </div>
                </div>

                {/* COLONNE DROITE */}
                <div className={styles.leaderboardColumn}>
                    <h2 className={styles.leaderboardTitle}>Leaderboard</h2>
                    {loadingStats ? (
                        <p className={styles.loadingText}>Chargement du leaderboard …</p>
                    ) : (
                        <Leaderboard data={sortedBoard} />
                    )}
                </div>
            </section>
        </div>
    );
}

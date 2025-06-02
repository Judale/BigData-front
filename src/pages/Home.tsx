import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ChartXKCD } from '../components/ChartXKCD';
import styles from '../styles/Home.module.css';
import logo from '../assets/Griboullon.png';

import { Leaderboard } from '../components/Leaderboard';

const decor = import.meta.glob('../assets/elements/*.{svg,png}', {
    eager: true,
    as: 'url'
}) as Record<string, string>;

function getAsset(name: string): string | null {
    const entry = Object.entries(decor).find(([path]) => path.includes(name));
    return entry ? entry[1] : null;
}

interface LeaderboardEntry {
    username: string;
    sum_points: number; // cumul des points (ranking)
    max_points: number; // meilleur score sur une partie
}

interface GeneralStats {
    leaderboard: LeaderboardEntry[];
    avg_points_per_drawing: number;
    avg_points_per_category: Record<string, number>;
    games_per_category: Record<string, number>;
}

export default function Home() {
    const navigate = useNavigate();

    const dashboardRef = useRef<HTMLDivElement>(null);
    const [dashboardVisible, setDashboardVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target === dashboardRef.current && entry.isIntersecting) {
                        setDashboardVisible(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );
        if (dashboardRef.current) observer.observe(dashboardRef.current);
        return () => observer.disconnect();
    }, []);


    const [stats, setStats] = useState<GeneralStats>({
        leaderboard: [],
        avg_points_per_drawing: 0,
        avg_points_per_category: {},
        games_per_category: {}
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
                    games_per_category: data.games_per_category ?? {}
                });
            })
            .catch((err) => {
                console.error('Erreur fetch /api/general-stats:', err);
            })
            .finally(() => {
                setLoadingStats(false);
            });
    }, []);


    const sortedBoard = Array.isArray(stats.leaderboard)
        ? [...stats.leaderboard].sort((a, b) => b.sum_points - a.sum_points)
        : [];


    const categoryKeys = Object.keys(stats.avg_points_per_category);
    const COLORS: Record<string, string> = {};
    const palette = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    categoryKeys.forEach((cat, idx) => {
        COLORS[cat] = palette[idx % palette.length];
    });


    const avgCat = stats.avg_points_per_category;
    const hasCategories = categoryKeys.length > 0;
    const categoryConfig = {
        title: 'Moyenne par catégorie',
        data: {
            labels: categoryKeys,
            datasets: [
                {
                    label: 'Moyenne des points',
                    data: categoryKeys.map((c) => avgCat[c]),
                    backgroundColor: categoryKeys.map((c) => COLORS[c])
                }
            ]
        },
        roughness: 2,
        strokeWidth: 2,
        fontFamily: 'Patrick Hand'
    };


    const hasLeaderboard = sortedBoard.length > 0;
    const top10ForLine = sortedBoard.slice(0, 10);
    const lineConfig = {
        title: 'Cumul de points du Top 10',
        data: {
            labels: top10ForLine.map((_, idx) => `#${idx + 1}`),
            datasets: [
                {
                    label: 'Cumul des points',
                    data: top10ForLine.map((u) => u.sum_points),
                    strokeColor: '#36A2EB'
                }
            ]
        },
        options: {
            showLegend: false
        },
        roughness: 2,
        strokeWidth: 2,
        fontFamily: 'Patrick Hand'
    };


    const gamesPerCat = stats.games_per_category;
    const catKeysForPie = Object.keys(gamesPerCat);
    const hasGamesData = catKeysForPie.length > 0;
    const pieConfig = {
        title: 'Répartition des parties par catégorie',
        data: {
            labels: catKeysForPie,
            datasets: [
                {
                    label: 'Nombre de parties',
                    data: catKeysForPie.map((c) => gamesPerCat[c]),
                    backgroundColor: catKeysForPie.map((c) => COLORS[c])
                }
            ]
        },
        roughness: 2,
        strokeWidth: 2,
        fontFamily: 'Patrick Hand'
    };


    const elements = [
        { name: 'Nuage.svg', style: styles.topLeft },
        { name: 'Bricks 1.svg', style: styles.midLeft },
        { name: 'Bricks 2.svg', style: styles.topRight },
        { name: 'Bricks 3.svg', style: styles.botLeft },
        { name: 'Coeur.svg', style: styles.heart },
        { name: 'Start.svg', style: styles.star },
        { name: 'Arrow.svg', style: styles.arrow }
    ];

    return (
        <div className={styles.container}>
            {/* ─── Décors positionnés ─── */}
            {elements.map((e, i) => {
                const src = getAsset(e.name);
                return src ? <img key={i} src={src} className={e.style} alt="" /> : null;
            })}

            {/* ─── Logo & tagline ─── */}
            <img src={logo} alt="Gribouillon" className={styles.logo} />
            <p className={styles.tagline}>Un trait, un mot, des fous rires garantis !</p>

            {/* ─── Bouton “Commencer” ─── */}
            <button className={styles.startButton} onClick={() => navigate('/game')} />

            {/* ─── Flèche vers dashboard ─── */}
            <div className={styles.arrowWrapper}>
                <span className={styles.downArrow}>↓</span>
            </div>

            {/* ─── Dashboard (invisible tant que non scrollé) ─── */}
            <div
                ref={dashboardRef}
                className={`${styles.dashboardWrapper} ${
                    dashboardVisible ? styles.dashboardVisible : ''
                }`}
            >
                <section className={styles.dashboardSection}>
                    {/* ─── COLONNE GAUCHE : trois graphiques empilés ─── */}
                    <div className={styles.chartsWrapper}>
                        {/* Bar‐Chart */}
                        <div className={styles.barChart}>
                            {loadingStats ? (
                                <p className={styles.loadingText}>
                                    Chargement des moyennes par catégorie …
                                </p>
                            ) : hasCategories ? (
                                <ChartXKCD
                                    type="Bar"
                                    width={400}
                                    height={200}
                                    config={categoryConfig}
                                />
                            ) : (
                                <p className={styles.loadingText}>
                                    Aucune catégorie disponible.
                                </p>
                            )}
                        </div>

                        {/* Pie‐Chart */}
                        <div className={styles.pieChart}>
                            {loadingStats ? (
                                <p className={styles.loadingText}>
                                    Chargement du camembert …
                                </p>
                            ) : hasGamesData ? (
                                <ChartXKCD
                                    type="Pie"
                                    width={400}
                                    height={200}
                                    config={pieConfig}
                                />
                            ) : (
                                <p className={styles.loadingText}>
                                    Pas de données de répartition pour le camembert.
                                </p>
                            )}
                        </div>

                        {/* Line‐Chart */}
                        <div className={styles.lineChart}>
                            {loadingStats ? (
                                <p className={styles.loadingText}>
                                    Chargement du graphique linéaire …
                                </p>
                            ) : hasLeaderboard ? (
                                <ChartXKCD
                                    type="Line"
                                    width={400}
                                    height={200}
                                    config={lineConfig}
                                />
                            ) : (
                                <p className={styles.loadingText}>
                                    Leaderboard vide.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ─── COLONNE DROITE : Leaderboard local ─── */}
                    <div className={styles.leaderboardColumn}>
                        <h2 className={styles.leaderboardTitle}>Leaderboard</h2>
                        {loadingStats ? (
                            <p className={styles.loadingText}>
                                Chargement du leaderboard …
                            </p>
                        ) : (
                            <Leaderboard data={sortedBoard} />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
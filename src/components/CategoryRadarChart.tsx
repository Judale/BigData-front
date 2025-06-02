import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import styles from '../styles/CategoryRadarChart.module.css';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const DIFFICULTIES = [
    { key: 'easy', label: 'Touriste', color: '#4CAF50' },
    { key: 'medium', label: 'Aventurier', color: '#FF9800' },
    { key: 'hard', label: 'Maître', color: '#F44336' },
];

type Props = {
    games: any[];
    valueType: 'avg_score' | 'avg_time_taken';
};

export default function CategoryRadarChart({
                                               games,
                                               valueType,
                                           }: Props) {
    const categoriesSet = new Set<string>();
    games.forEach((g) =>
        Array.isArray(g.categories) &&
        g.categories.forEach((cat: string) => categoriesSet.add(cat))
    );
    const categories = Array.from(categoriesSet);

    const datasets = DIFFICULTIES.map((diff) => {
        const data = categories.map((cat) => {
            const gamesForCatDiff = games.filter(
                (g: any) =>
                    Array.isArray(g.categories) &&
                    g.categories.includes(cat) &&
                    g.difficulty === diff.key
            );
            if (!gamesForCatDiff.length) return 0;
            if (valueType === 'avg_score') {
                const avg =
                    gamesForCatDiff.reduce(
                        (sum: number, g: any) => sum + g.total_points,
                        0
                    ) / gamesForCatDiff.length;
                return Math.round(avg * 100) / 100;
            } else {
                const avg =
                    gamesForCatDiff.reduce(
                        (sum: number, g: any) => sum + (g.avg_time_taken ?? 0),
                        0
                    ) / gamesForCatDiff.length;
                return Math.round(avg * 100) / 100;
            }
        });
        return {
            label: diff.label,
            data,
            backgroundColor: diff.color + '33',
            borderColor: diff.color,
            borderWidth: 2,
            pointBackgroundColor: diff.color,
        };
    });

    const data = {
        labels: categories,
        datasets,
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: { family: '"Patrick Hand", cursive', size: 14 },
                },
            },
            tooltip: { enabled: true },
        },
        scales: {
            r: {
                angleLines: { display: true },
                suggestedMin: 0,
                suggestedMax: valueType === 'avg_score' ? 500 : undefined,
                pointLabels: {
                    font: { size: 16, family: '"Patrick Hand", cursive' },
                },
                ticks: {
                    font: { size: 14, family: '"Patrick Hand", cursive' },
                    stepSize: valueType === 'avg_score' ? 50 : 1,
                },
            },
        },
    };

    return (
        <div className={styles.wrapper}>
            <h3 className={styles.title}>
                {valueType === 'avg_score'
                    ? 'Score moyen par catégorie et difficulté'
                    : 'Rapidité moyenne (s) par catégorie et difficulté'}
            </h3>
            <Radar data={data} options={options} />
        </div>
    );
}

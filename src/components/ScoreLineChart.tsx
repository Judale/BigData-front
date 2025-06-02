import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
} from 'chart.js';
import styles from '../styles/ScoreLineChart.module.css';

ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
);

type Props = {
    games: { game_id: number; total_points: number }[];
};

export default function ScoreLineChart({ games }: Props) {
    const sortedGames = [...games].sort((a, b) => a.game_id - b.game_id);

    const data = {
        labels: sortedGames.map((g) => `#${g.game_id}`),
        datasets: [
            {
                label: 'Score par partie',
                data: sortedGames.map((g) => g.total_points),
                fill: false,
                borderColor: '#B561EC',
                backgroundColor: '#B561EC',
                tension: 0.2,
                pointRadius: 4,
                pointBackgroundColor: '#FB8CA1',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
        scales: {
            x: { title: { display: true, text: 'Partie' } },
            y: {
                title: { display: true, text: 'Score' },
                beginAtZero: true,
            },
        },
    };

    return (
        <div className={styles.wrapper}>
            <h3 className={styles.title}>Évolution de ton score par partie</h3>
            <Line data={data} options={options} />
        </div>
    );
}

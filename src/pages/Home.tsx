import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import logo from '../assets/Griboullon.png';
import HomeDashboard from '../components/HomeDashboard';

const decor = import.meta.glob('../assets/elements/*.{svg,png}', {
    eager: true,
    as: 'url'
}) as Record<string, string>;

function getAsset(name: string): string | null {
    const entry = Object.entries(decor).find(([path]) => path.includes(name));
    return entry ? entry[1] : null;
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
        <div>
        <div className={styles.container}>
            {/* ─── Décors positionnés ─── */}
            {elements.map((e, i) => {
                const src = getAsset(e.name);
                return src ? <img key={i} src={src} className={e.style} alt="" /> : null;
            })}

            <img src={logo} alt="Gribouillon" className={styles.logo} />
            <p className={styles.tagline}>Un trait, un mot, des fous rires garantis !</p>

            <button className={styles.startButton} onClick={() => navigate('/game')} />

        </div>
            <HomeDashboard dashboardRef={dashboardRef} visible={dashboardVisible} />

        </div>
    );
}

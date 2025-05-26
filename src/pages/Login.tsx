import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api.ts';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from '../styles/Auth.module.css';

const decorFiles = [
    'Bricks 1.svg',
    'Bricks 2.svg',
    'Bricks 3.svg',
    'Coeur.svg',
    'Nuage.svg',
    'Start.svg',
];

const decor = import.meta.glob('../assets/elements/*.{svg,png}', {
    eager: true,
    as: 'url',
}) as Record<string, string>;

function getAsset(name: string) {
    const entry = Object.entries(decor).find(([k]) => k.includes(name));
    return entry ? entry[1] : '';
}

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || '/profile';
    const [form, setForm] = useState({ username: '', password: '' });

    // Tire 4 décors au hasard au premier rendu
    const chosenDecor = useMemo(() => {
        const shuffled = [...decorFiles].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4).map((f) => getAsset(f));
    }, []);

    // Génére un style aléatoire pour chaque décor
    const decorStyles = useMemo(() => {
        return chosenDecor.map(() => ({
            top:  `${Math.random() * 80 + 10}%`,    // entre 10% et 90%
            left: `${Math.random() * 80 + 10}%`,
            width: `${Math.random() * 150 + 50}px`, // entre 50px et 200px
        }));
    }, [chosenDecor]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/login', form);
            login(res.data.token);
            navigate(from, { replace: true });
        } catch {
            alert('Identifiants invalides');
        }
    };

    return (
        <div className={styles.container}>
            {/* Décors en arrière-plan */}
            {chosenDecor.map((src, i) => (
                <img
                    key={i}
                    src={src}
                    className={styles.decorItem}
                    style={decorStyles[i]}
                    alt=""
                />
            ))}

            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.title}>Connexion</h2>

                <input
                    className={styles.input}
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                    }
                />

                <input
                    className={styles.input}
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                {/* Bouton HTML “normal” */}
                <button type="submit" className={styles.submitButton}>
                    Se connecter
                </button>

                <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                    Déjà un compte ?&nbsp;
                    <Link to="/register" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
                        Inscrit-Toi
                    </Link>
                </p>
            </form>
        </div>
    );
}

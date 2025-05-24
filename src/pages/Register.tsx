import { useState, useMemo } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
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

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });

    const chosenDecor = useMemo(() => {
        const shuffled = [...decorFiles].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4).map((f) => getAsset(f));
    }, []);

    const decorStyles = useMemo(() => {
        return chosenDecor.map(() => ({
            top:  `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
            width: `${Math.random() * 150 + 50}px`,
        }));
    }, [chosenDecor]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/register', form);
            alert('Compte créé ! Connecte-toi');
            navigate('/login');
        } catch {
            alert('Erreur lors de la création');
        }
    };

    return (
        <div className={styles.container}>
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
                <h2 className={styles.title}>Inscription</h2>

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


                <button type="submit" className={styles.submitButton}>
                    S'inscrire
                </button>

                <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                    Déjà un compte ?&nbsp;
                    <Link to="/login" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
                        Connecte-toi
                    </Link>
                </p>
            </form>
        </div>
    );
}

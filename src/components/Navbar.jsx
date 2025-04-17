import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        setIsLoggedIn(false);
        navigate("/");
    };

    return (
        <nav className={styles.navbar}>
            <Link to="/" className={styles.logo}>Gribouillon</Link>
            <div className={styles.links}>
                <Link to="/game" className={styles.link}>Jeu</Link>
                <Link to="/drawings" className={styles.link}>Dessins</Link>
                <Link to="/profile" className={styles.link}>Profil</Link>
                {isLoggedIn ? (
                    <button onClick={handleLogout} className={styles.linkbtn}>Déconnexion</button>
                ) : (
                    <Link to="/login" className={styles.link}>Connexion</Link>
                )}
            </div>
        </nav>
    );
}

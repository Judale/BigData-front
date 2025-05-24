import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import styles from "../styles/NavBar.module.css";

export default function NavBar() {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { to: "/", label: "Accueil", class: styles.link0 },
        { to: "/game", label: "Jouer", class: styles.link1 },
        { to: "/my-drawings", label: "Mes dessins", class: styles.link2 },
        { to: "/profile", label: "Profil", class: styles.link3 },
    ];

    return (
        <nav className={styles.navbar}>
            <h1 className={styles.title} aria-label="Gribouillon"></h1>

            <button
                className={styles.burger}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                <GiHamburgerMenu />
            </button>

            <div className={`${styles.links} ${menuOpen ? styles.show : ""}`}>
                {navLinks.map((link, index) => (
                    <Link
                        key={index}
                        to={link.to}
                        className={link.class}
                        aria-current={location.pathname === link.to ? "page" : undefined}
                        onClick={() => setMenuOpen(false)}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}

import styles from "../styles/Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <p>© {new Date().getFullYear()} Gribouillon. Tous droits réservés.</p>
            <div className={styles.links}>
                <a href="/about">À propos</a>
                <a href="/how-to-play">Comment jouer</a>
            </div>
        </footer>
    );
}

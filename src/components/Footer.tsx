import styles from "../styles/Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <p>© {new Date().getFullYear()} Gribouillon. Dessiné avec ❤️ par :</p>
                <ul className={styles.creators}>
                    <li>Thibault Bravar</li>
                    <li>Rémy Georjon</li>
                    <li>Alexis Macle</li>
                    <li>Victor Robalo</li>
                </ul>
                <p className={styles.tagline}>Esquissez, partagez, amusez-vous !</p>
            </div>
        </footer>
    );
}

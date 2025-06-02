import styles from "../styles/Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <p>© {new Date().getFullYear()} Gribouillon. Dessiné avec ❤️ par :</p>
                <ul className={styles.creators}>
                    <li className={styles.un}>Thibault Bravar</li>
                    <li className={styles.deux}>Rémy Georjon</li>
                    <li className={styles.trois}>Alexis Macle</li>
                    <li className={styles.quatre}>Victor Robalo</li>
                </ul>
                <p className={styles.tagline}>Esquissez, partagez, amusez-vous !</p>
            </div>
        </footer>
    );
}

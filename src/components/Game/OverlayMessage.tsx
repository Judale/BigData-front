// OverlayMessage.tsx
import styles from "../../styles/Game.module.css";

export default function OverlayMessage({ message }: { message: string }) {
    return <div className={styles.overlay}>{message}</div>;
}

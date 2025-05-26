import { useNavigate } from "react-router-dom";
import styles from "../styles/Home.module.css";
import logo from "../assets/Griboullon.png";

const decor = import.meta.glob("../assets/elements/*.{svg,png}", {
  eager: true,
  as: "url"
}) as Record<string, string>;

const getAsset = (name: string) => {
  const entry = Object.entries(decor).find(([k]) => k.includes(name));
  return entry ? entry[1] : null;
};

export default function Home() {
  const navigate = useNavigate();

  const elements = [
    { src: getAsset("Nuage.svg"), style: styles.topLeft },
    { src: getAsset("Bricks 1.svg"), style: styles.midLeft },
    { src: getAsset("Bricks 2.svg"), style: styles.topRight },
    { src: getAsset("Bricks 3.svg"), style: styles.botLeft },
    { src: getAsset("Coeur.svg"), style: styles.heart },
    { src: getAsset("Start.svg"), style: styles.star },
    { src: getAsset("Arrow.svg"), style: styles.arrow },
  ];

  return (
    <div className={styles.container}>
      {elements.map((e, i) => e.src && <img key={i} src={e.src} className={e.style} alt="" />)}

      <img src={logo} alt="Gribouillon" className={styles.logo} />

      <p className={styles.tagline}>Un trait, un mot, des fous rires garantis !</p>

      <button className={styles.startButton} onClick={() => navigate("/game")}></button>
    </div>
  );
}

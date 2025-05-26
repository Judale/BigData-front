import { useEffect, useState } from "react";
import styles from "../../styles/GameSetup.module.css";
import api from "../../api";

const decorImages = import.meta.glob("../../assets/elements/*.{svg,png}", {
    eager: true,
    as: "url"
}) as Record<string, string>;

const getDecorUrl = (name: string) => {
    const entry = Object.entries(decorImages).find(([k]) => k.includes(name));
    return entry ? entry[1] : null;
};

export default function GameSetup({ form, setForm, onStart }: { form: any; setForm: (f: any) => void; onStart?: () => void }) {
    const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        api.get<{ id: number; name: string }[]>("/api/categories").then((res) => {
            setCategories(res.data.map((c) => c.name));
        });
    }, []);

    const catImages: Record<string, string> = import.meta.glob(
        "../../assets/categories/*.{png,svg}",
        { eager: true, as: "url" }
    ) as Record<string, string>;

    const buttonImage = import.meta.glob("../../assets/elements/Button.svg", { eager: true, as: "url" });
    const buttonURL = Object.values(buttonImage)[0];

    const getImageForCategory = (cat: string): string | null => {
        const match = Object.entries(catImages).find(([key]) =>
            key.includes(`/categories/${cat}.svg`) || key.includes(`/categories/${cat}.png`)
        );
        return match ? match[1] : null;
    };

    const getCadreImage = (): string | null => {
        const match = Object.entries(catImages).find(([key]) =>
            key.includes("/categories/Cadre.svg")
        );
        return match ? match[1] : null;
    };

    const cadreImage = getCadreImage();

    const descriptions: Record<string, string> = {
        Animaux: "Des poils, des plumes, des pattes… et parfois un bec ! Prêt à gribouiller la jungle entière ?",
        Objet: "Tout ce qui ne miaule pas et ne se mange pas ! Dessine une fusée ou… une chaussette !",
        Nourriture: "Attention à la bave : ici, on dessine avec l’estomac ! Une banane ? Ou un burger mutant ?",
        Test: "La catégorie fourre-tout qu’on devait cacher… mais on a oublié!"
    };

    const modeDescriptions: Record<string, string> = {
        single: "Concentre-toi sur une seule catégorie… et deviens son maître absolu !",
        multi: "Un peu d’animaux, un soupçon d’objets, une pincée de bouffe… un cocktail créatif !",
        all: "Tout peut tomber ! Même une girafe mangeant une fusée…",
        versus: "Affronte ton adversaire crayon contre crayon, que le meilleur artiste gagne !"
    };

    const difficultyDescriptions: Record<string, string> = {
        easy: "Des mots simples, pour se chauffer sans pression.",
        medium: "Un bon équilibre entre fun et défi !",
        hard: "Pour les artistes fous… ou les masochistes du trait !"
    };

    const lengthDescriptions: Record<number, string> = {
        5: "3 coups de crayon et c’est plié !",
        10: "Le tempo parfait : ni trop vite, ni trop lent.",
        15: "Accroche ton crayon, ça va durer !"
    };

    const toggleCat = (c: string) => {
        setForm((prev: any) => {
            const set = new Set(prev.categories);
            const mode = prev.mode;

            if (mode === "all") return prev;

            if (mode === "single") {
                if (set.has(c)) set.delete(c);
                else {
                    set.clear();
                    set.add(c);
                }
            } else {
                set.has(c) ? set.delete(c) : set.add(c);
            }

            return { ...prev, categories: Array.from(set) };
        });
    };

    const shadowColors = [styles.shadow0, styles.shadow1, styles.shadow2, styles.shadow3];
    const bgColors = [styles.bg0, styles.bg1, styles.bg2, styles.bg3];

    const decorElements = [
        { src: getDecorUrl("Start.svg"), className: styles.bgStart },
        { src: getDecorUrl("Bricks 2.svg"), className: styles.bgBricks },
        { src: getDecorUrl("Coeur.svg"), className: styles.bgHeart },
    ];

    useEffect(() => {
        if (form.mode === "all") {
            setForm((prev: any) => ({ ...prev, categories: [...categories] }));
        }
    }, [form.mode, categories]);

    const canStart = () => {
        const count = form.categories.length;
        switch (form.mode) {
            case "single": return count === 1;
            case "multi": return count >= 2;
            case "all": return true;
            case "versus": return count >= 1;
            default: return false;
        }
    };

    return (
        <div className={styles.setupContainer}>
            {decorElements.map((e, i) =>
                e.src ? <img key={i} src={e.src} className={e.className} alt="" /> : null
            )}

            <div className={styles.tabHeader}>
                <button className={activeTab === "presets" ? styles.tabActive : styles.tabInactive} onClick={() => setActiveTab("presets")}>PréRéglages</button>
                <button className={activeTab === "custom" ? styles.tabActive : styles.tabInactive} onClick={() => setActiveTab("custom")}>Personnalisations</button>
            </div>

            {activeTab === "presets" && (
                <div className={styles.tabContent}>
                    <h2>Mode de Jeu :</h2>
                    <div className={styles.buttonRow}>
                        {[{ label: "Mono-Mania", value: "single" }, { label: "Mix & Match", value: "multi" }, { label: "Tout mélangé", value: "all" }, { label: "Duel de Doodles", value: "versus" }].map(({ label, value }, index) => {
                            const isSelected = form.mode === value;
                            const colorClass = shadowColors[index % shadowColors.length];
                            const bgClass = isSelected ? bgColors[index % bgColors.length] : "";
                            return (
                                <div key={value} className={styles.tooltipContainer}>
                                    <button
                                        className={`${styles.modeButton} ${colorClass} ${bgClass}`}
                                        onClick={() => setForm((prev: any) => ({ ...prev, mode: value, categories: [] }))}
                                    >
                                        {label}
                                    </button>
                                    <div className={styles.tooltipText}>{modeDescriptions[value]}</div>
                                </div>
                            );
                        })}
                    </div>

                    <h2>Catégories :</h2>
                    <div className={styles.categoryGrid}>
                        {categories.map((c, i) => {
                            const selected = form.categories.includes(c);
                            const colorClass = shadowColors[i % 4];
                            const bgClass = selected ? bgColors[i % 4] : "";
                            const cardClass = `${styles.categoryCard} ${colorClass} ${bgClass} ${selected ? styles.cardSelected : ""}`;
                            return (
                                <div
                                    key={c}
                                    className={cardClass}
                                    onClick={() => form.mode !== "all" && toggleCat(c)}
                                    style={{ cursor: form.mode === "all" ? "not-allowed" : "pointer" }}
                                >
                                    <div className={styles.frameWrapper}>
                                        {cadreImage && <img src={cadreImage} alt="Cadre" className={styles.frame} />}
                                        {getImageForCategory(c) && <img src={getImageForCategory(c)!} alt={c} className={styles.catImage} />}
                                    </div>
                                    <h3>{c}</h3>
                                    <p>{descriptions[c] || ""}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === "custom" && (
                <div className={styles.tabContent}>
                    <h2>Difficulté :</h2>
                    <div className={styles.buttonRow}>
                        {[{ label: "Touriste", value: "easy" }, { label: "Aventurier", value: "medium" }, { label: "Maître", value: "hard" }].map(({ label, value }, index) => {
                            const isSelected = form.difficulty === value;
                            const colorClass = shadowColors[index % shadowColors.length];
                            const bgClass = isSelected ? bgColors[index % bgColors.length] : "";
                            return (
                                <div key={value} className={styles.tooltipContainer}>
                                    <button
                                        className={`${styles.modeButton} ${colorClass} ${bgClass}`}
                                        onClick={() => setForm((prev: any) => ({ ...prev, difficulty: value }))}
                                    >
                                        {label}
                                    </button>
                                    <div className={styles.tooltipText}>{difficultyDescriptions[value]}</div>
                                </div>
                            );
                        })}
                    </div>

                    <h2>Durée :</h2>
                    <div className={styles.buttonRow}>
                        {[{ label: "Éclair", value: 5 }, { label: "Classique", value: 10 }, { label: "Marathon", value: 15 }].map(({ label, value }, index) => {
                            const isSelected = form.length === value;
                            const colorClass = shadowColors[index % shadowColors.length];
                            const bgClass = isSelected ? bgColors[index % bgColors.length] : "";
                            return (
                                <div key={value} className={styles.tooltipContainer}>
                                    <button
                                        className={`${styles.modeButton} ${colorClass} ${bgClass}`}
                                        onClick={() => setForm((prev: any) => ({ ...prev, length: value }))}
                                    >
                                        {label}
                                    </button>
                                    <div className={styles.tooltipText}>{lengthDescriptions[value]}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {onStart && (
                <div className={styles.startButtonWrapper}>
                    <img
                        src={buttonURL}
                        alt="Lancer la partie"
                        className={`${styles.startButton} ${!canStart() ? styles.disabled : ""}`}
                        onClick={canStart() ? onStart : undefined}
                        style={{ cursor: canStart() ? 'pointer' : 'not-allowed', opacity: canStart() ? 1 : 0.5 }}
                    />
                </div>
            )}
        </div>
    );
}

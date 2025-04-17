import { useMemo } from "react";

// Importe toutes les images SVG du dossier assets
const allAssets = import.meta.glob("/src/assets/*.svg", { eager: true });

// 5 positions fixes
const fixedPositions = [
    { top: "5%", left: "10%",  width: "250px" },
    { top: "20%", left: "80%", width: "100px" },
    { top: "-7%", left: "55%", width: "200px"},
    { top: "63%", left: "25%", width: "150px" },
    { top: "85%", left: "85%", width: "300px" },
];

const getRandomDecor = (count = 5) => {
    const entries = Object.entries(allAssets);
    const shuffled = entries.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(([path, mod]) => ({
        src: mod.default,
        rotation: Math.floor(Math.random() * 360)
    }));
};

export default function BackgroundDecor() {
    // Génère aléatoirement les images et leur rotation, une seule fois
    const decorItems = useMemo(() => getRandomDecor(5), []);

    return (
        <>
            {decorItems.map((item, index) => {
                const pos = fixedPositions[index];
                return (
                    <img
                        key={index}
                        src={item.src}
                        alt={`decor-${index}`}
                        style={{
                            position: "absolute",
                            top: pos.top,
                            left: pos.left,
                            transform: `rotate(${item.rotation}deg)`,
                            width: pos.width,
                            opacity: 1,
                            zIndex: 0,
                            pointerEvents: "none",
                        }}
                    />
                );
            })}
        </>
    );
}

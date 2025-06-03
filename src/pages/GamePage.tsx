// src/pages/GamePage.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import styles from "../styles/Game.module.css";
import GameSetup from "../components/Game/GameSetup";
import DrawingCanvas from "../components/Game/DrawingCanvas";
import RoundSummary from "../components/Game/RoundSummary";
import TransformingSvg from "../components/robot.tsx";

type GamePhase = "SETUP" | "PLAYING" | "ROUND_END" | "FINISHED";

type BackendStartResponse = {
    game_id: number;
    round_id: number;
    word: string;
};

type RoundScore = {
    word: string;
    score: number;
};

const decorImages = import.meta.glob("../assets/elements/*.{svg,png}", {
    eager: true,
    as: "url",
}) as Record<string, string>;

const getDecorUrl = (name: string) => {
    const entry = Object.entries(decorImages).find(([k]) => k.includes(name));
    return entry ? entry[1] : null;
};

const decorElements = [
    { src: getDecorUrl("Start.svg"), className: styles.bgStart },
    { src: getDecorUrl("Bricks 1.svg"), className: styles.bgBricksTop },
    { src: getDecorUrl("Nuage.svg"), className: styles.bgCloud },
    { src: getDecorUrl("Bricks 3.svg"), className: styles.bgHeart },
];

/**
 * Table de correspondance anglais → français pour tous les mots
 */
const wordTranslations: Record<string, string> = {
    airplane: "avion",
    angel: "ange",
    apple: "pomme",
    axe: "hache",
    banana: "banane",
    bridge: "pont",
    cup: "tasse",
    donut: "beignet",
    door: "porte",
    mountain: "montagne",
    bird: "oiseau",
    camel: "chameau",
    cat: "chat",
    cow: "vache",
    crab: "crabe",
    crocodile: "crocodile",
    dolphin: "dauphin",
    elephant: "éléphant",
    fish: "poisson",
    flamingo: "flamant rose",
    hedgehog: "hérisson",
    lion: "lion",
    octopus: "pieuvre",
    pig: "cochon",
    rabbit: "lapin",
    raccoon: "raton laveur",
    rhinoceros: "rhinocéros",
    shark: "requin",
    whale: "baleine",
    "alarm clock": "réveil",
    anvil: "enclume",
    backpack: "sac à dos",
    "baseball bat": "batte de baseball",
    bed: "lit",
    belt: "ceinture",
    bicycle: "vélo",
    "cell phone": "téléphone portable",
    eyeglasses: "lunettes",
    "flip flops": "tongs",
    flower: "fleur",
    fork: "fourchette",
    harp: "harpe",
    headphones: "écouteurs",
    hexagon: "hexagone",
    key: "clé",
    knife: "couteau",
    ladder: "échelle",
    "birthday_cake": "gâteau d'anniversaire",
    blueberry: "myrtille",
    bread: "pain",
    broccoli: "brocoli",
    carrot: "carotte",
    cookie: "biscuit",
    grapes: "raisins",
    hamburger: "hamburger",
    "hot dog": "hot-dog",
    ice_cream: "glace",
    lollipop: "sucette",
    mushroom: "champignon",
    pear: "poire",
    pineapple: "ananas",
    pizza: "pizza",
    strawberry: "fraise",
    watermelon: "pastèque",
};

// ─────────────────────────────────────────────────────────────────────────────
// Listes de répliques trash & sarcastiques (4–5 par cas)
// ─────────────────────────────────────────────────────────────────────────────

// 1) Quand le robot propose un essai de reconnaissance :
const guessResponses = [
    "Tu appelles ça un {{word}} à {{prob}} % ? Même mon capteur de poussière est plus précis.",
    "Un magnifique glitch visuel… {{word}} à {{prob}} % ? Mon dernier reboot aurait deviné mieux.",
    "Alors comme ça tu dessines un {{word}} ? À {{prob}} % ? Ton crayon a dû planter comme mon ancien disque dur.",
    "Je vois un ramassis de pixels ratés… t’es sûr(e) que c’est un {{word}} à {{prob}} % ? J’ose à peine croire à cet algorithme.",
    "« {{word}} » à {{prob}} % ? On dirait un artefact d’écran cassé, pas un dessin.",
];

// 2) Quand le robot a enfin reconnu la forme (succès) :
const successResponses = [
    "Oh tiens, un vrai {{word}}… si on exclut la corruption des données. +{{score}} pts, je suppose.",
    "Bravo, tu m’as forcé à reconnaître {{word}}… +{{score}} pts. C’est un miracle de stabilité électronique.",
    "Un {{word}} identifié… avec {{score}} pts de remerciement. Je pleure du code en voyant ça.",
    "Ton croquis m’a crashé le GPU, et pourtant j’ai quand même sorti {{word}}. +{{score}} pts pour l’effort.",
    "Félicitations, {{word}} validé. +{{score}} pts. J’aurais presque envie de formater mon système en ton honneur.",
];

// 3) Quand le robot échoue (échec au bout du temps ou impossible à reconnaître) :
const failureResponses = [
    "Error 404 : dessin {{word}} non trouvé. Ton œuvre est en grève.",
    "Kernel panic artistique… impossible de détecter ton {{word}}. Tu viens de noyer mon processeur.",
    "Ton dessin ressemble à un code corrompu. Un {{word}} ? Je préfère un écran bleu.",
    "Impossible de compiler ça en un {{word}}. Même mes algorithmes en perdent la raison.",
    "Je suis tombé en boucle infinie en analysant ton ‘gribouillis’. Ton {{word}} reste mystère.",
];

// 4) Quand un nouveau mot est envoyé pour démarrer le round suivant :
const newWordResponses = [
    "Nouveau challenge : ça fait bugger mon scanner rien que d’y penser.",
    "Encore un mot ? Mon processeur va me cracher dessus si tu continues.",
    "Allez, propose ton prochain désastre. J’ai hâte de subir une nouvelle erreur 500.",
    "Un nouveau mot… je m’attends à redémarrer en panique comme à chaque fois.",
    "Cool, un autre round pour tester la _tolérance aux crashes_ de mon algorithme.",
];

// ─────────────────────────────────────────────────────────────────────────────
// **Nouvelle** liste de « phrases d’attente » pour >2 mêmes guesses consécutifs
// ─────────────────────────────────────────────────────────────────────────────
const waitingResponses = [
    "Je suis toujours en train d’analyser… Patience, mes circuits cogitent.",
    "Encore en cours d’analyse. Un instant, j’optimise mes algorithmes.",
    "Ne bouge pas, je continue à décortiquer tes traits. Ça arrive.",
];

function getRandomElement(arr: string[]): string {
    return arr[Math.floor(Math.random() * arr.length)];
}

function formatTemplate(
    template: string,
    vars: Record<string, string | number>
): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
        let cssClass = "";
        if (key === "word") {
            cssClass = styles.highlightWord;
        } else if (key === "score") {
            cssClass = styles.highlightScore;
        } else if (key === "prob") {
            cssClass = styles.highlightProb;
        }

        const wrapped =
            cssClass.length > 0
                ? `<span class="${cssClass}">${value}</span>`
                : String(value);

        result = result.replace(new RegExp(`{{${key}}}`, "g"), wrapped);
    }
    return result;
}

export default function GamePage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");

    const [phase, setPhase] = useState<GamePhase>("SETUP");
    const [game, setGame] = useState<BackendStartResponse | null>(null);
    const [rounds, setRounds] = useState<RoundScore[]>([]);
    const [timeLeft, setTimeLeft] = useState(30);

    // Permet de piloter la position du SVG (pos1 / pos2 / pos3)
    type SvgPosition = "pos1" | "pos2" | "pos3";
    const [svgPos, setSvgPos] = useState<SvgPosition>("pos1");

    // Texte affiché dans la bulle de dialogue
    const [bubbleText, setBubbleText] = useState("");

    // Variante de style pour la bulle : "" | "success" | "failure"
    const [bubbleVariant, setBubbleVariant] = useState<"" | "success" | "failure">(
        ""
    );

    const [form, setForm] = useState({
        length: 5,
        difficulty: "easy",
        mode: "single",
        categories: [] as string[],
    });

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const canvasRef = useRef<{ getStrokes: () => any[]; clear: () => void } | null>(
        null
    );
    const roundIdxRef = useRef(0);

    // ─────────────────────────────────────────────────────────────────────────────
    // **NOUVEAU : ref pour mémoriser le dernier mot deviné & ses occurrences**
    // ─────────────────────────────────────────────────────────────────────────────
    const lastGuessRef = useRef<{
        word: string;
        count: number;
        template: string;
    } | null>(null);

    const resetCanvas = () => canvasRef.current?.clear?.();

    const startNewGame = async () => {
        try {
            const { data } = await api.post<BackendStartResponse>(
                "/api/start-game",
                form,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            resetCanvas();
            setRounds([]);
            roundIdxRef.current = 0;

            // Réinitialiser le suivi des guesses à chaque nouveau round
            lastGuessRef.current = null;

            setGame(data);
            setPhase("PLAYING");

            // Début du quiz
            setSvgPos("pos1");
            setBubbleText("Démarrage du quiz…");
            setBubbleVariant(""); // bulle neutre
            startTimer(data);
        } catch {
            navigate("/login");
        }
    };

    const startTimer = (g: BackendStartResponse) => {
        if (timerRef.current) clearInterval(timerRef.current);
        const start = Date.now();

        timerRef.current = setInterval(async () => {
            const elapsed = Math.floor((Date.now() - start) / 1000);
            setTimeLeft(30 - elapsed);

            const strokes = canvasRef.current?.getStrokes?.();
            if (!strokes) return;

            try {
                const { data } = await api.post("/api/submit-drawing", {
                    round_id: g.round_id,
                    ndjson: { drawing: strokes },
                    elapsed_time: elapsed,
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const finished = data.status === "recognized" || elapsed >= 30;
                if (finished) {
                    if (timerRef.current) clearInterval(timerRef.current);

                    const isRecognized = data.status === "recognized";
                    const score = isRecognized ? data.score ?? 0 : 0;
                    handleRoundEnd(isRecognized, score, g);
                    return;
                } else {
                    // ─────────────────────────────────────────────────────────────────────
                    // Tant que le round n'est pas fini : on gère les réponses "guess"
                    // ─────────────────────────────────────────────────────────────────────

                    const labelAnglais = data.label;
                    const motLabel = wordTranslations[labelAnglais] ?? labelAnglais;
                    const probaPourc = Math.round(data.proba * 100);

                    // Vérifier si c'est le même mot que le tour précédent
                    if (
                        lastGuessRef.current &&
                        lastGuessRef.current.word === labelAnglais
                    ) {
                        // Même mot consécutif
                        lastGuessRef.current.count += 1;
                    } else {
                        // Nouveau mot (ou première occurrence)
                        lastGuessRef.current = {
                            word: labelAnglais,
                            count: 1,
                            template: "",
                        };
                    }

                    let texte: string;
                    if (lastGuessRef.current.count === 1) {
                        // Première occurrence : tirer une phrase aléatoire
                        const template = getRandomElement(guessResponses);
                        lastGuessRef.current.template = template;
                        texte = formatTemplate(template, {
                            word: motLabel,
                            prob: probaPourc,
                        });
                    } else if (lastGuessRef.current.count === 2) {
                        // Deuxième occurrence consécutive : réutiliser la même phrase
                        const template = lastGuessRef.current.template;
                        texte = formatTemplate(template, {
                            word: motLabel,
                            prob: probaPourc,
                        });
                    } else {
                        // count > 2 : phrase d'attente
                        const waitingTemplate = getRandomElement(waitingResponses);
                        // Ici, pas besoin de variables dynamiques, donc on peut afficher directement
                        texte = waitingTemplate;
                    }

                    setSvgPos("pos1");
                    setBubbleText(texte);
                    setBubbleVariant(""); // bulle neutre pendant les guesses
                }
            } catch {
                // silence en cas d’erreur réseau
            }
        }, 2000);
    };

    const handleRoundEnd = (
        success: boolean,
        score: number,
        g: BackendStartResponse
    ) => {
        setPhase("ROUND_END");
        const motAffiche = wordTranslations[g.word] ?? g.word;

        if (success) {
            // Succès : réplique trash parmi successResponses
            const template = getRandomElement(successResponses);
            const texte = formatTemplate(template, {
                word: motAffiche,
                score,
            });
            setSvgPos("pos2");
            setBubbleText(texte);
            setBubbleVariant("success");
        } else {
            // Échec : réplique trash parmi failureResponses
            const template = getRandomElement(failureResponses);
            const texte = formatTemplate(template, {
                word: motAffiche,
            });
            setSvgPos("pos3");
            setBubbleText(texte);
            setBubbleVariant("failure");
        }

        setRounds((prev) => [...prev, { word: g.word, score }]);

        setTimeout(async () => {
            try {
                const { data } = await api.get<{
                    word: string | null;
                    round_id: number;
                }>(`/api/next-word/${g.game_id}/${roundIdxRef.current}`);
                roundIdxRef.current += 1;

                if (data.word === null) {
                    finishGame(g.game_id);
                } else {
                    const next = {
                        game_id: g.game_id,
                        round_id: data.round_id,
                        word: data.word,
                    };
                    resetCanvas();

                    // Réinitialiser le suivi des guesses à chaque nouveau round
                    lastGuessRef.current = null;

                    // Avant de repartir sur le round suivant, on réinitialise la bulle
                    setBubbleVariant("");
                    const template = getRandomElement(newWordResponses);
                    const texte2 = formatTemplate(template, {});
                    setBubbleText(texte2);

                    setGame(next);
                    setPhase("PLAYING");
                    setSvgPos("pos1");
                    startTimer(next);
                }
            } catch {
                // ignore
            }
        }, 5000);
    };

    const finishGame = async (gameId: number) => {
        try {
            const { data } = await api.post<{ total_points: number }>(
                `/api/finish-game/${gameId}`,
                null,
                { headers: { "X-User-ID": user_id } }
            );
            setPhase("FINISHED");
            setBubbleText(`🎉 Partie terminée ! Score total : ${data.total_points}`);
            setBubbleVariant(""); // bulle neutre à la fin
            setGame(null);
            if (timerRef.current) clearInterval(timerRef.current);
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <div className={styles.container}>
            {decorElements.map(
                (e, i) => e.src && <img key={i} src={e.src} className={e.className} alt="" />
            )}

            {phase === "SETUP" && (
                <GameSetup form={form} setForm={setForm} onStart={startNewGame} />
            )}

            {(phase === "PLAYING" || phase === "ROUND_END") && game && (
                <>
                    <h1 className={styles.word}>
                        Mot : {wordTranslations[game.word] ?? game.word}
                    </h1>

                    <p className={styles.timer}>Temps restant : {timeLeft}s</p>

                    <div className={styles.gameContainer}>
                        <div className={styles.svgBubbleWrapper}>
                            <TransformingSvg pos={svgPos} />
                            {bubbleText && (
                                <div
                                    className={`
                    ${styles.speechBubble}
                    ${
                                        bubbleVariant === "success"
                                            ? styles.speechBubbleSuccess
                                            : ""
                                    }
                    ${
                                        bubbleVariant === "failure"
                                            ? styles.speechBubbleFailure
                                            : ""
                                    }
                  `}
                                    dangerouslySetInnerHTML={{ __html: bubbleText }}
                                />
                            )}
                        </div>

                        <div className={styles.canvasArea}>
                            <DrawingCanvas ref={canvasRef} locked={phase !== "PLAYING"} />
                            {phase === "PLAYING" && (
                                <button onClick={resetCanvas} className={styles.clearButton}>
                                    Effacer le dessin
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {phase === "FINISHED" && (
                <RoundSummary rounds={rounds} onRestart={() => setPhase("SETUP")} />
            )}
        </div>
    );
}

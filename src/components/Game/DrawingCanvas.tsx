// DrawingCanvas.tsx

import {
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    forwardRef,
} from "react";
import styles from "../../styles/Game.module.css";

import PencilSvg from "../../assets/pencil.svg";

type DrawingCanvasProps = {
    locked: boolean;
};

type Stroke = [number[], number[]]; // [xs[], ys[]]

const DrawingCanvas = forwardRef<
    { getStrokes: () => Stroke[]; clear: () => void },
    DrawingCanvasProps
>(({ locked }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);

    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Stroke>([[], []]);
    const [drawing, setDrawing] = useState(false);

    const [mode, setMode] = useState<"draw" | "erase">("draw");

    const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const [isHovering, setIsHovering] = useState(false);

    useImperativeHandle(ref, () => ({
        getStrokes: () => strokes,
        clear: () => {
            if (!canvasRef.current) return;
            const ctx = canvasRef.current.getContext("2d")!;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setStrokes([]);
            setCurrentStroke([[], []]);
        },
    }));

    const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return [0, 0];
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        return [
            (e.clientX - rect.left) * scaleX,
            (e.clientY - rect.top) * scaleY,
        ];
    };

    const redrawAll = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d")!;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        for (const [xs, ys] of strokes) {
            if (xs.length === 0) continue;
            ctx.beginPath();
            ctx.moveTo(xs[0], ys[0]);
            for (let i = 1; i < xs.length; i++) {
                ctx.lineTo(xs[i], ys[i]);
            }
            ctx.stroke();
        }
        ctx.beginPath();
    };

    const tryEraseStrokeAt = (x: number, y: number) => {
        const threshold = 6; // pixels
        for (let idx = 0; idx < strokes.length; idx++) {
            const [xs, ys] = strokes[idx];
            for (let i = 0; i < xs.length; i++) {
                const dx = xs[i] - x;
                const dy = ys[i] - y;
                if (dx * dx + dy * dy <= threshold * threshold) {
                    setStrokes((prev) => prev.filter((_, j) => j !== idx));
                    return;
                }
            }
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (locked) return;
        const [x, y] = getCanvasPos(e);

        if (mode === "erase") {
            tryEraseStrokeAt(x, y);
            return;
        }

        setDrawing(true);
        setCurrentStroke([[x], [y]]);

        const ctx = canvasRef.current!.getContext("2d")!;
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (wrapRef.current) {
            const rect = wrapRef.current.getBoundingClientRect();
            setCursorPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }

        if (locked || mode !== "draw" || !drawing) return;
        const [x, y] = getCanvasPos(e);
        setCurrentStroke(([xs, ys]) => [
            [...xs, x],
            [...ys, y],
        ]);
        const ctx = canvasRef.current!.getContext("2d")!;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const handleMouseUp = () => {
        if (!drawing) return;
        setDrawing(false);
        setStrokes((prev) => [...prev, currentStroke]);
        setCurrentStroke([[], []]);
        const ctx = canvasRef.current!.getContext("2d")!;
        ctx.beginPath();
    };

    useEffect(() => {
        if (!canvasRef.current || !wrapRef.current) return;
        const size = wrapRef.current.offsetWidth;
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        const ctx = canvasRef.current.getContext("2d")!;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
    }, []);

    useEffect(() => {
        redrawAll();
    }, [strokes]);

    return (
        <div className={styles.container}>
            <div
                ref={wrapRef}
                className={styles.canvasWrapper}
                onMouseMove={(e) => {
                    if (wrapRef.current) {
                        const rect = wrapRef.current.getBoundingClientRect();
                        setCursorPos({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                        });
                    }
                }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <canvas
                    ref={canvasRef}
                    className={styles.canvas}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />

                {isHovering && (
                    <img
                        src={PencilSvg}
                        className={styles.pencilCursor}
                        style={{
                            left: cursorPos.x,
                            top: cursorPos.y,
                            transform:
                                mode === "draw"
                                    ? `translate(-15%, -78%) rotate(-30deg)`
                                    : `translate(-15%, -78%) rotate(-220deg)`,
                        }}
                        alt="cursor"
                    />
                )}

                {/* Boutons “Draw” / “Erase” positionnés en bas à droite du canvas */}
                <div className={styles.modeButtons}>
                    <button
                        className={mode === "draw" ? styles.activeButton : styles.inactiveButton}
                        onClick={() => setMode("draw")}
                    >
                        Dessiner
                    </button>
                    <button
                        className={mode === "erase" ? styles.activeButton : styles.inactiveButton}
                        onClick={() => setMode("erase")}
                    >
                        Effacer
                    </button>
                </div>

                {locked && <div className={styles.canvasLock} />}
            </div>
        </div>
    );
});

export default DrawingCanvas;

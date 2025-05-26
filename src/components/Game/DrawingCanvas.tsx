// DrawingCanvas.tsx
import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import styles from "../../styles/Game.module.css";

const DrawingCanvas = forwardRef<{ getStrokes: () => any[]; clear: () => void }, { locked: boolean }>(
    ({ locked }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const wrapRef = useRef<HTMLDivElement>(null);
        const [drawing, setDrawing] = useState(false);
        const [strokes, setStrokes] = useState<any[]>([]);
        const [currentStroke, setCurrentStroke] = useState<[number[], number[]]>([[], []]);

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

        const pos = (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!canvasRef.current) return [0, 0];
            const rect = canvasRef.current.getBoundingClientRect();
            const scaleX = canvasRef.current.width / rect.width;
            const scaleY = canvasRef.current.height / rect.height;
            return [
                (e.clientX - rect.left) * scaleX,
                (e.clientY - rect.top) * scaleY,
            ];
        };

        const down = (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (locked) return;
            setDrawing(true);
            const [x, y] = pos(e);
            setCurrentStroke([[x], [y]]);
        };

        const move = (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!drawing || locked) return;
            const [x, y] = pos(e);
            setCurrentStroke(([xs, ys]) => [[...xs, x], [...ys, y]]);
            const ctx = canvasRef.current!.getContext("2d")!;
            ctx.lineTo(x, y);
            ctx.stroke();
        };

        const up = () => {
            if (!drawing) return;
            setDrawing(false);
            setStrokes((p) => [...p, currentStroke]);
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

        return (
            <div ref={wrapRef} className={styles.canvasWrapper}>
                <canvas
                    ref={canvasRef}
                    className={styles.canvas}
                    onMouseDown={down}
                    onMouseMove={move}
                    onMouseUp={up}
                    onMouseLeave={up}
                />
                {locked && <div className={styles.canvasLock} />}

            </div>

        );
    }
);

export default DrawingCanvas;

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import styles from "../styles/Canvas.module.css";

const DrawingCanvas = forwardRef(({ locked = false }, ref) => {
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);

    const [drawing, setDrawing] = useState(false);
    const [strokes, setStrokes] = useState([]);
    const [currentStroke, setCurrentStroke] = useState([[], []]);

    useImperativeHandle(ref, () => ({
        getStrokes: () => strokes,
        clear: () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setStrokes([]);
            setCurrentStroke([[], []]);
        },
    }));

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return [(e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY];
    };

    const startDraw = (e) => {
        if (locked) return;
        setDrawing(true);
        const [x, y] = getPos(e);
        setCurrentStroke([[x], [y]]);
    };

    const draw = (e) => {
        if (!drawing || locked) return;
        const [x, y] = getPos(e);
        setCurrentStroke(([prevX, prevY]) => [[...prevX, x], [...prevY, y]]);

        const ctx = canvasRef.current.getContext("2d");
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const endDraw = () => {
        if (!drawing) return;
        setDrawing(false);
        setStrokes((prev) => [...prev, currentStroke]);
        setCurrentStroke([[], []]);

        const ctx = canvasRef.current.getContext("2d");
        ctx.beginPath();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        const ctx = canvas.getContext("2d");

        // Ajuste la taille interne du canvas
        const size = wrapper.offsetWidth;
        canvas.width = size;
        canvas.height = size;

        // Style de dessin
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";
    }, []);

    return (
        <div ref={wrapperRef} className={styles.canvasWrapper}>
            <canvas
                ref={canvasRef}
                className={`${styles.canvas} ${locked ? styles.locked : ""}`}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
            />
            {locked && (
                <div className={styles.overlay}>
                    ✋ Dessin verrouillé
                </div>
            )}
        </div>
    );
});

export default DrawingCanvas;

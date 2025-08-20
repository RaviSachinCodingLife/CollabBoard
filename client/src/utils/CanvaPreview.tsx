import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";

interface CanvasPreviewProps {
    board: any;
    width?: number;
    height?: number;
}

const CanvasPreview: React.FC<CanvasPreviewProps> = ({ board, width = 220, height = 220 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.StaticCanvas | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !board) return;
        if (fabricRef.current) {
            fabricRef.current.dispose();
            fabricRef.current = null;
        }

        const canvas = new fabric.StaticCanvas(canvasRef.current, { selection: false });
        fabricRef.current = canvas;
        canvas.setWidth(width);
        canvas.setHeight(height);

        const json = { objects: board[0].objects || [] };
        json.objects.forEach((obj: any) => {
            if (obj.type === "image" && (!obj.src || obj.src === "")) {
                obj.src = undefined;
            }
        });

        canvas.loadFromJSON(json, () => {
            canvas.renderAll();
            const objs = canvas.getObjects();
            if (objs.length > 0) {
                let left = Infinity,
                    top = Infinity,
                    right = -Infinity,
                    bottom = -Infinity;

                objs.forEach((obj) => {
                    const rect = obj.getBoundingRect(true);
                    left = Math.min(left, rect.left);
                    top = Math.min(top, rect.top);
                    right = Math.max(right, rect.left + rect.width);
                    bottom = Math.max(bottom, rect.top + rect.height);
                });

                const contentWidth = right - left;
                const contentHeight = bottom - top;
                const scale = Math.min(width / contentWidth, height / contentHeight) * 0.9;

                canvas.setZoom(scale);
                canvas.absolutePan({
                    x: (width - contentWidth * scale) / 2 - left * scale,
                    y: (height - contentHeight * scale) / 2 - top * scale,
                });
            }
        });

        return () => {
            if (fabricRef.current) {
                fabricRef.current.dispose();
                fabricRef.current = null;
            }
        };
    }, [board, width, height]);

    return <canvas ref={canvasRef} width={width} height={height} style={{ border: "1px solid #ccc" }} />;
};

export default CanvasPreview;

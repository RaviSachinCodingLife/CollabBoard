import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../services/socket";
import { getCloudfrontUrl } from "../utils/cloudfront";

function Board() {
    const { id } = useParams<{ id: string }>(); // type params from URL
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!id) return;

        socket.emit("joinBoard", { boardId: id });

        const canvas = canvasRef.current;
        if (!canvas) return; // ✅ fix null error

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        socket.on("draw", ({ x, y }: { x: number; y: number }) => {
            ctx.fillStyle = "black";
            ctx.fillRect(x, y, 2, 2);
        });

        return () => {
            socket.emit("leaveBoard", { boardId: id });
            socket.off("draw");
        };
    }, [id]);

    const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        socket.emit("draw", { boardId: id, x, y });
    };

    return (
        <div>
            <h3>Board {id}</h3>

            {/* CloudFront snapshot example */}
            <img
                src={getCloudfrontUrl("snapshots/board1.png")}
                alt="Board Snapshot"
            />

            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{ border: "1px solid black" }}
                onMouseMove={(e) => {
                    if (e.buttons === 1) handleDraw(e);
                }}
            />
        </div>
    );
}

export default Board;

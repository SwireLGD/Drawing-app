import { useEffect, useRef, useState } from "react";
import { Drawing } from "./types";
import './App.css';

const DrawingApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState<string>('#000000');
  
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/canvas');

    ws.current.onclose = () => console.log("ws closed");

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'INITIAL_STATE' || message.type === 'NEW_DRAW') {
          message.payload.forEach((draw: Drawing) => drawOnCanvas(draw));
      }
    };
  }, []);

  const drawOnCanvas = (data: Drawing) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = data.color;
    ctx.beginPath();
    ctx.arc(data.x, data.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setIsDrawing(true);
    sendDrawData(e.clientX - rect.left, e.clientY - rect.top, color);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    sendDrawData(e.clientX - rect.left, e.clientY - rect.top, color);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const sendDrawData = (x: number, y: number, color: string) => {
    const drawing: Drawing = { x, y, color };
    if (ws.current) {
      ws.current.send(JSON.stringify(drawing));
    }
    drawOnCanvas(drawing);
  };

  return (
    <div className="container">
      <h1>Drawing App</h1>
      <input type="color" value={color} onChange={e => setColor(e.target.value)} className="color" />
      <canvas
        ref={canvasRef}
        width={1200}
        height={700}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseUp}
        style={{ border: '2px solid black', borderRadius: '20px', marginTop: '10px' }}
      />
    </div>
  );
};

export default DrawingApp;
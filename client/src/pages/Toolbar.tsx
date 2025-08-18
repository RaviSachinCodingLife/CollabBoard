
import "../styles/toolbar.css";

type Props = {
  isDrawing: boolean;
  setIsDrawing: (v: boolean) => void;
  brushColor: string;
  setBrushColor: (c: string) => void;
  brushWidth: number;
  setBrushWidth: (w: number) => void;
  onSave: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
};

export default function Toolbar(props: Props) {
  const { isDrawing, setIsDrawing, brushColor, setBrushColor, brushWidth, setBrushWidth, onSave, onZoomIn, onZoomOut, onResetZoom } = props;
  return (
    <div className="toolbar">
      <button className={`tool-btn ${isDrawing ? "active" : ""}`} onClick={() => setIsDrawing(!isDrawing)}>{isDrawing ? "Pen ON" : "Pen OFF"}</button>
      <label>Color <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} /></label>
      <label>Size <input type="range" min={1} max={60} value={brushWidth} onChange={e => setBrushWidth(Number(e.target.value))} /> {brushWidth}px</label>
      <div>
        <button onClick={onZoomOut}>−</button>
        <button onClick={onResetZoom}>100%</button>
        <button onClick={onZoomIn}>+</button>
      </div>
      <button onClick={onSave}>Save</button>
    </div>
  );
}

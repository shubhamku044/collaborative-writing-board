import { CANVAS_SIZE } from '@/common/constants/canvasSize';
import { WheelEvent, useEffect, useRef, useState } from 'react';
import { useKeyPressEvent } from 'react-use';
interface Line {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}
const Canvas = () => {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [lines, setLines] = useState<Line[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newCtx = canvas.getContext('2d');
    if (newCtx) setCtx(newCtx);
  }, []);

  useKeyPressEvent('Control', (e) => {
    if (e.ctrlKey && !isDragging) {
      setIsDragging(true);
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        lines.forEach((line) => {
          ctx.strokeStyle = line.color;
          ctx.lineWidth = line.width / zoom;
          ctx.lineCap = 'round';
          ctx.beginPath();
          line.points.forEach((point, idx) => {
            const adjustedX = (point.x + position.x) / zoom;
            const adjustedY = (point.y + position.y) / zoom;
            if (idx === 0) {
              ctx.moveTo(adjustedX, adjustedY);
            } else {
              ctx.lineTo(adjustedX, adjustedY);
            }
            ctx.stroke();
          });
        });
      }
    }
  }, [zoom, position.x, position.y, lines]);

  const handleMouseWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    console.log('something with the wheel');
    const newScale = e.deltaY > 0 ? zoom * 1.2 : zoom / 1.2;
    setZoom(Math.min(Math.max(newScale, 0.2), 3));
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMouseDown) console.log(e.clientX, e.clientY);
    if (isDrawing && isMouseDown) {
      const currentPos = {
        x: (e.clientX - position.x) / zoom,
        y: (e.clientY - position.y) / zoom,
      };

      setLines((prevLines) => {
        const lastLine = prevLines[prevLines.length - 1];
        return [
          ...prevLines.slice(0, -1),
          {
            ...lastLine,
            points: [...lastLine.points, currentPos],
          },
        ];
      });
    }

    if (isDragging && isMouseDown) {
      console.log('moving the canvas');
      const deltaX = (e.clientX - lastMousePos.current.x) / zoom;
      const deltaY = (e.clientY - lastMousePos.current.y) / zoom;

      setPosition({
        x: position.x + deltaX,
        y: position.y + deltaY,
      });
    }
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('mouse down');
    setIsMouseDown(true);
    if (isDrawing) {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      const color = 'white';
      const strokeWidth = 5;
      setLines((prevLines) => [
        ...prevLines,
        {
          points: [
            {
              x: (e.clientX - position.x) / zoom,
              y: (e.clientY - position.y) / zoom,
            },
          ],
          color,
          width: strokeWidth,
        },
      ]);
    }
  };
  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        className={`bg-green-500 ${isDragging && 'cursor-move'}`}
        style={{
          cursor: isDragging ? 'grabbing' : isDrawing ? 'crosshair' : 'grab',
        }}
        onWheel={handleMouseWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div className="fixed right-10 top-10 flex gap-2 rounded bg-purple-800 p-8">
        <button
          className="bg-blue-500 p-4"
          onClick={() => {
            setIsDragging(false);
            setIsDrawing(true);
          }}
        >
          Draw
        </button>
        <button
          className="bg-blue-500 p-4"
          onClick={() => {
            setIsDragging(true);
            setIsDrawing(false);
          }}
        >
          Move
        </button>
      </div>
    </div>
  );
};

export default Canvas;

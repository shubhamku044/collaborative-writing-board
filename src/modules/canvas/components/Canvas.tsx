import {
  WheelEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { CgShapeRhombus } from 'react-icons/cg';
import { FaHandMiddleFinger, FaPen, FaRegCircle } from 'react-icons/fa';
import { IoArrowDownOutline, IoRemoveOutline } from 'react-icons/io5';
import { PiRectangleThin } from 'react-icons/pi';
import { useKeyPressEvent } from 'react-use';
import rough from 'roughjs';

const generator = rough.generator();
interface Drawing {
  type: 'line' | 'rect' | 'circle' | 'freehand' | 'rhombus' | 'arrow';
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

enum Selected {
  PEN = 'PEN',
  GRAB = 'GRAB',
  RECT = 'RECT',
  RHOMBUS = 'RHOMBUS',
  CIRCLE = 'CIRCLE',
  ARROW = 'ARROW',
  LINE = 'LINE',
}

const Canvas = () => {
  const [canvasSize, setCanvasSize] = useState({ width: 2000, height: 1000 });
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [lines, setLines] = useState<Drawing[]>([]);
  const [selected, setSelected] = useState<Selected>(Selected.PEN);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newCtx = canvas.getContext('2d');
    if (newCtx) setCtx(newCtx);
  }, []);
  useLayoutEffect(() => {
    if (!window) return;
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
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
          const roughCanvas = rough.canvas(canvas);
          if (line.type === 'freehand') {
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
          }
          if (line.type === 'rect') {
            const rect = generator.rectangle(
              line.points[0].x,
              line.points[0].y,
              line.points[line.points.length - 1].x - line.points[0].x,
              line.points[line.points.length - 1].y - line.points[0].y,
              {
                fill: 'white',
                strokeWidth: 2,
                stroke: 'white',
              }
            );
            roughCanvas.draw(rect);
          }
          if (line.type === 'rhombus') {
            const rect = generator.rectangle(
              line.points[0].x,
              line.points[0].y,
              line.points[line.points.length - 1].x - line.points[0].x,
              line.points[line.points.length - 1].y - line.points[0].y,
              {
                fill: 'white',
                strokeWidth: 2,
                stroke: 'white',
              }
            );
            roughCanvas.draw(rect);
          }
          if (line.type === 'circle') {
            const circle = generator.ellipse(
              (line.points[line.points.length - 1].x - line.points[0].x) / 2 +
                line.points[0].x,
              (line.points[line.points.length - 1].y - line.points[0].y) / 2 +
                line.points[0].y,
              line.points[line.points.length - 1].x - line.points[0].x,
              line.points[line.points.length - 1].y - line.points[0].y,
              {
                fill: 'white',
                strokeWidth: 2,
                stroke: 'white',
              }
            );
            roughCanvas.draw(circle);
          }
          if (line.type === 'arrow') {
            const stLine = generator.line(
              line.points[0].x,
              line.points[0].y,
              line.points[line.points.length - 1].x,
              line.points[line.points.length - 1].y,
              {
                strokeWidth: 2,
                stroke: 'white',
              }
            );
            const arrow1 = generator.line(
              line.points[line.points.length - 1].x - 10,
              line.points[line.points.length - 1].y - 10,
              line.points[line.points.length - 1].x,
              line.points[line.points.length - 1].y,
              {
                strokeWidth: 2,
                stroke: 'red',
              }
            );
            const arrow2 = generator.line(
              line.points[line.points.length - 1].x + 10,
              line.points[line.points.length - 1].y + 10,
              line.points[line.points.length - 1].x,
              line.points[line.points.length - 1].y,
              {
                strokeWidth: 2,
                stroke: 'red',
              }
            );
            roughCanvas.draw(stLine);
            roughCanvas.draw(arrow1);
            roughCanvas.draw(arrow2);
          }
          if (line.type === 'line') {
            const stLine = generator.line(
              line.points[0].x,
              line.points[0].y,
              line.points[line.points.length - 1].x,
              line.points[line.points.length - 1].y,
              {
                strokeWidth: 2,
                stroke: 'white',
              }
            );

            roughCanvas.draw(stLine);
          }
          if (line.type === 'rhombus') {
            const rect = generator.rectangle(
              line.points[0].x,
              line.points[0].y,
              line.points[line.points.length - 1].x - line.points[0].x,
              line.points[line.points.length - 1].y - line.points[0].y,
              {
                fill: 'white',
                strokeWidth: 2,
                stroke: 'white',
              }
            );
            roughCanvas.draw(rect);
          }
        });
      }
    }
  }, [zoom, position.x, position.y, lines]);

  const handleMouseWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    console.log('something with the wheel');
    const scaleFactor = e.deltaY > 0 ? 1.2 : 0.8;
    const newScale = Math.min(Math.max(zoom * scaleFactor, 0.2), 3);
    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (canvasBounds) {
      const mouseX = e.clientX - canvasBounds.left;
      const mouseY = e.clientY - canvasBounds.top;
      const newPosX = position.x - mouseX / newScale;
      const newPosY = position.y - mouseY / newScale;
      setZoom(newScale);
      console.log(newPosX, newPosY);
      setPosition({ x: newPosX, y: newPosY });
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && isMouseDown && selected === Selected.PEN) {
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
    if (isMouseDown && isDrawing && selected === Selected.RECT) {
      const currentPos = {
        x: (e.clientX - position.x) / zoom,
        y: (e.clientY - position.y) / zoom,
      };
      generator.rectangle(100, 100, 200, 200);
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
    if (isMouseDown && isDrawing && selected === Selected.RHOMBUS) {
      const currentPos = {
        x: (e.clientX - position.x) / zoom,
        y: (e.clientY - position.y) / zoom,
      };
      generator.rectangle(100, 100, 200, 200);
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
    if (isMouseDown && isDrawing && selected === Selected.CIRCLE) {
      const currentPos = {
        x: (e.clientX - position.x) / zoom,
        y: (e.clientY - position.y) / zoom,
      };
      generator.rectangle(100, 100, 200, 200);
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
    if (isMouseDown && isDrawing && selected === Selected.ARROW) {
      const currentPos = {
        x: (e.clientX - position.x) / zoom,
        y: (e.clientY - position.y) / zoom,
      };
      generator.rectangle(100, 100, 200, 200);
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
    if (isMouseDown && isDrawing && selected === Selected.LINE) {
      const currentPos = {
        x: (e.clientX - position.x) / zoom,
        y: (e.clientY - position.y) / zoom,
      };
      generator.rectangle(100, 100, 200, 200);
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
  };
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('mouse down');
    setIsMouseDown(true);
    if (isDrawing && selected === Selected.PEN) {
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
          type: 'freehand',
        },
      ]);
    }
    if (isDrawing && selected === Selected.RECT) {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      const color = 'red';
      const strokeWidth = 5;
      setLines((prv) => {
        return [
          ...prv,
          {
            points: [
              {
                x: (e.clientX - position.x) / zoom,
                y: (e.clientY - position.y) / zoom,
              },
            ],
            color,
            width: strokeWidth,
            type: 'rect',
          },
        ];
      });
    }
    if (isDrawing && selected === Selected.RHOMBUS) {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      const color = 'red';
      const strokeWidth = 5;
      setLines((prv) => {
        return [
          ...prv,
          {
            points: [
              {
                x: (e.clientX - position.x) / zoom,
                y: (e.clientY - position.y) / zoom,
              },
            ],
            color,
            width: strokeWidth,
            type: 'rhombus',
          },
        ];
      });
    }
    if (isDrawing && selected === Selected.CIRCLE) {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      const color = 'red';
      const strokeWidth = 5;
      setLines((prv) => {
        return [
          ...prv,
          {
            points: [
              {
                x: (e.clientX - position.x) / zoom,
                y: (e.clientY - position.y) / zoom,
              },
            ],
            color,
            width: strokeWidth,
            type: 'circle',
          },
        ];
      });
    }
    if (isDrawing && selected === Selected.ARROW) {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      const color = 'red';
      const strokeWidth = 5;
      setLines((prv) => {
        return [
          ...prv,
          {
            points: [
              {
                x: (e.clientX - position.x) / zoom,
                y: (e.clientY - position.y) / zoom,
              },
            ],
            color,
            width: strokeWidth,
            type: 'arrow',
          },
        ];
      });
    }
    if (isDrawing && selected === Selected.LINE) {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      const color = 'red';
      const strokeWidth = 5;
      setLines((prv) => {
        return [
          ...prv,
          {
            points: [
              {
                x: (e.clientX - position.x) / zoom,
                y: (e.clientY - position.y) / zoom,
              },
            ],
            color,
            width: strokeWidth,
            type: 'line',
          },
        ];
      });
    }
  };
  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className={`bg-green-500 ${isDragging && 'cursor-move'}`}
        style={{
          cursor: isDragging ? 'grabbing' : isDrawing ? 'crosshair' : 'grab',
        }}
        onWheel={handleMouseWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div className="fixed left-6 top-1/2 flex -translate-y-1/2 flex-col gap-2 rounded bg-gray-300 p-8">
        <button
          className="rounded-sm bg-gray-600 p-2"
          onClick={() => {
            setIsDragging(false);
            setIsDrawing(true);
            setSelected(Selected.PEN);
          }}
        >
          <FaPen className="text-xl text-white" />
        </button>
        <button
          className="rounded-sm bg-gray-600 p-2"
          onClick={() => {
            setIsDragging(true);
            setIsDrawing(false);
            setSelected(Selected.GRAB);
          }}
        >
          <FaHandMiddleFinger className="text-xl text-white" />
        </button>
        <button
          className="rounded-sm bg-gray-600 p-2"
          onClick={() => {
            setIsDrawing(true);
            setIsDragging(false);
            setSelected(Selected.RECT);
          }}
        >
          <PiRectangleThin className="text-xl text-white" />
        </button>
        <button
          className="rounded-sm bg-gray-600 p-2"
          onClick={() => {
            setIsDrawing(true);
            setIsDragging(false);
            setSelected(Selected.RHOMBUS);
          }}
        >
          <CgShapeRhombus className="text-xl text-white" />
        </button>
        <button
          className="rounded-sm bg-gray-600 p-2"
          onClick={() => {
            setIsDrawing(true);
            setIsDragging(false);
            setSelected(Selected.CIRCLE);
          }}
        >
          <FaRegCircle className="text-xl text-white" />
        </button>
        <button
          className="rounded-sm bg-gray-600 p-2"
          onClick={() => {
            setIsDrawing(true);
            setIsDragging(false);
            setSelected(Selected.ARROW);
          }}
        >
          <IoArrowDownOutline className="text-xl text-white" />
        </button>
        <button
          className="rounded-sm bg-gray-600 p-2"
          onClick={() => {
            setIsDrawing(true);
            setIsDragging(false);
            setSelected(Selected.LINE);
          }}
        >
          <IoRemoveOutline className="text-xl text-white" />
        </button>
      </div>
    </div>
  );
};

export default Canvas;

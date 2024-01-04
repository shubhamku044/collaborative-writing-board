'use client';
import { useEffect, useRef, useState } from 'react';
import { useDraw } from '../../common/hooks/drawing';
import { socket } from '../../common/lib/socket';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D>();

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [options, setOptions] = useState<CtxOptions>({
    lineColor: '#000',
    lineWidth: 5,
  });

  const { handleDraw, handleEndDrawing, handleStartDrawing, drawing } = useDraw(
    options,
    ctxRef.current
  );

  const handleResize = () => {
    setSize({ width: window.innerWidth, height: window.innerHeight });
  };
  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  useEffect(() => {
    handleResize();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctxRef.current = ctx;
    }
  }, [options.lineColor, options.lineWidth]);

  const drawFromSocket = (
    socketMover: [number, number][],
    socketOptions: CtxOptions
  ) => {
    const tempCtx = ctxRef.current;

    if (tempCtx) {
      tempCtx.lineWidth = socketOptions.lineWidth;
      tempCtx.strokeStyle = socketOptions.lineColor;

      tempCtx.beginPath();
      socketMover.forEach(([x, y]) => {
        tempCtx.lineTo(x, y);
        tempCtx.stroke();
      });
      tempCtx.closePath();
    }
  };

  useEffect(() => {
    let movesToDrawLater: [number, number][] = [];
    let optionsToUseLater: CtxOptions = {
      lineColor: '',
      lineWidth: 0,
    };

    socket.on('socket_draw', (movesToDraw, socketOptions) => {
      if (ctxRef.current && !drawing) {
        drawFromSocket(movesToDraw, socketOptions);
      } else {
        movesToDrawLater = movesToDraw;
        optionsToUseLater = socketOptions;
      }
    });

    return () => {
      socket.off('socket_draw');
      if (movesToDrawLater.length) {
        drawFromSocket(movesToDrawLater, optionsToUseLater);
      }
    };
  }, [drawing]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="absolute left-0 top-0 flex w-fit flex-col gap-4">
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white"
          onClick={() => setOptions({ lineColor: 'blue', lineWidth: 5 })}
        >
          blue
        </button>
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white"
          onClick={() =>
            setOptions((prv) => {
              return {
                ...prv,
                lineWidth: prv.lineWidth + 1,
              };
            })
          }
        >
          +
        </button>
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white"
          onClick={() =>
            setOptions((prv) => {
              return {
                ...prv,
                lineWidth: prv.lineWidth - 1,
              };
            })
          }
        >
          -
        </button>
      </div>
      <canvas
        className="h-full w-full"
        ref={canvasRef}
        onMouseDown={(e) => handleStartDrawing(e.clientX, e.clientY)}
        onMouseUp={handleEndDrawing}
        onMouseMove={(e) => handleDraw(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          handleStartDrawing(
            e.changedTouches[0].clientX,
            e.changedTouches[0].clientY
          );
        }}
        onTouchEnd={handleEndDrawing}
        onTouchMove={(e) => {
          handleDraw(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }}
        width={size.width}
        height={size.height}
      />
    </div>
  );
}

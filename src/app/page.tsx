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

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

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
      <button onClick={() => setOptions({ lineColor: 'blue', lineWidth: 5 })}>
        blue
      </button>
      <canvas
        className="h-full w-full"
        onMouseDown={(e) => handleStartDrawing(e.clientX, e.clientY)}
        ref={canvasRef}
      />
    </div>
  );
}

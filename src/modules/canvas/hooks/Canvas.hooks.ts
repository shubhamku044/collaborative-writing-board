import { socket } from '@/common/lib/socket';
import { useOptions } from '@/common/recoil/options';
import { useEffect, useState } from 'react';

let moves: [number, number][] = [];

export const useDraw = (
  ctx: CanvasRenderingContext2D | undefined,
  blocked: boolean,
  movedX: number,
  movedY: number,
  handleEnd: () => void
) => {
  const opts = useOptions();
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    if (ctx) {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = opts.lineWidth;
      ctx.strokeStyle = opts.lineColor;
    }
  });

  const handleStartDrawing = (x: number, y: number) => {
    if (!ctx || blocked) return;
    moves = [[x + movedX, y + movedY]];
    setDrawing(true);
    ctx.beginPath();
    ctx.lineTo(x + movedX, y + movedY);
    ctx.stroke();
  };

  const handleEndDrawing = () => {
    if (!ctx) return;
    socket.emit('draw', moves, opts);

    setDrawing(false);
    ctx.closePath();
    handleEnd();
  };

  const handleDraw = (x: number, y: number) => {
    if (ctx && drawing) {
      moves.push([x + movedX, y + movedY]);
      ctx.lineTo(x + movedX, y + movedY);
      ctx.stroke();
    }
  };

  return {
    handleDraw,
    handleEndDrawing,
    handleStartDrawing,
    drawing,
  };
};

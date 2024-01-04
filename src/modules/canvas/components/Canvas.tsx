import { CANVAS_SIZE } from '@/common/constants/canvasSize';
import { useViewportSize } from '@/common/hooks/useViewportSize';
import { socket } from '@/common/lib/socket';
import { useDraw } from '@/modules/canvas/hooks/Canvas.hooks';
import { motion, useMotionValue } from 'framer-motion';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useKeyPressEvent } from 'react-use';
import { drawFromSocket } from '../helpers/Canvas.helpers';
import Minimap from './Minimap';

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smallCanvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [dragging, setDragging] = useState(false);
  const [movedMiniMap, setMovedMiniMap] = useState(false);
  const { width, height } = useViewportSize();

  useKeyPressEvent('Control', (e) => {
    if (e.ctrlKey && !dragging) {
      setDragging(true);
    }
  });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const copyCanvasToSmall = () => {
    if (smallCanvasRef.current) {
      smallCanvasRef.current
        ?.getContext('2d')
        ?.drawImage(
          canvasRef.current as HTMLCanvasElement,
          0,
          0,
          CANVAS_SIZE.width,
          CANVAS_SIZE.height
        );
    }
  };
  const { drawing, handleDraw, handleEndDrawing, handleStartDrawing } = useDraw(
    ctx,
    dragging,
    -x.get(),
    -y.get(),
    copyCanvasToSmall
  );

  useEffect(() => {
    const newCtx = canvasRef.current?.getContext('2d');
    if (newCtx) setCtx(newCtx);
    function handleKeyUp(ev: KeyboardEvent): void {
      if (!ev.ctrlKey && dragging) {
        setDragging(false);
      }
    }

    window.addEventListener('keyup', handleKeyUp as () => void);

    return () => {
      window.removeEventListener('keyup', handleKeyUp as () => void);
    };
  }, [dragging]);

  useEffect(() => {
    let movesToDrawLater: [number, number][] = [];
    let optionsToUseLater: CtxOptions = {
      lineColor: '',
      lineWidth: 0,
    };

    socket.on('socket_draw', (movesToDraw, socketOptions) => {
      if (ctx && !drawing) {
        drawFromSocket(movesToDraw, socketOptions, ctx, copyCanvasToSmall);
      } else {
        movesToDrawLater = movesToDraw;
        optionsToUseLater = socketOptions;
      }
    });

    return () => {
      socket.off('socket_draw');
      if (movesToDrawLater.length && ctx) {
        drawFromSocket(
          movesToDrawLater,
          optionsToUseLater,
          ctx,
          copyCanvasToSmall
        );
      }
    };
  }, [drawing, ctx]);

  return (
    <div className="h-full w-full overflow-hidden">
      <motion.canvas
        ref={canvasRef}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        className={`bg-white ${dragging && 'cursor-move'}`}
        style={{
          x,
          y,
        }}
        drag={dragging}
        dragConstraints={{
          left: -(CANVAS_SIZE.width - width),
          right: 0,
          top: -(CANVAS_SIZE.height - height),
          bottom: 0,
        }}
        dragElastic={0}
        dragTransition={{ power: 0, timeConstant: 0 }}
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
      />
      <Minimap
        ref={smallCanvasRef}
        x={x}
        y={y}
        dragging={dragging}
        setMovedMinimap={setMovedMiniMap}
      />
    </div>
  );
};

export default Canvas;

import { CANVAS_SIZE } from '@/common/constants/canvasSize';
import { MotionValue, motion, useMotionValue } from 'framer-motion';
import { Dispatch, SetStateAction, forwardRef, useEffect, useRef } from 'react';

interface IProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  dragging: boolean;
  setMovedMinimap: Dispatch<SetStateAction<boolean>>;
}

const Minimap = forwardRef<HTMLCanvasElement, IProps>(function (props, ref) {
  const { x, y, dragging, setMovedMinimap } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  const miniX = useMotionValue(0);
  const miniY = useMotionValue(0);

  useEffect(() => {
    miniX.on('change', (newX) => {
      if (!dragging) {
        x.set(-newX * 10);
      }
    });

    miniY.on('change', (newY) => {
      if (!dragging) {
        y.set(-newY * 10);
      }
    });
  }, [dragging, x, y, miniX, miniY]);
  return (
    <div
      className="absolute right-10 top-10 z-50 bg-zinc-500"
      ref={containerRef}
      style={{
        width: CANVAS_SIZE.width / 20,
        height: CANVAS_SIZE.height / 20,
      }}
    >
      <canvas
        ref={ref}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        className="h-full w-full"
      />
      <motion.div
        drag
        dragConstraints={containerRef}
        dragElastic={0}
        dragTransition={{ power: 0, timeConstant: 0 }}
        onDragEnd={() => setMovedMinimap((prv) => !prv)}
        style={{
          width: 5000 / 20,
          height: 5000 / 20,
        }}
        className="absolute left-0 top-0 cursor-grab border-2 border-blue-500"
        animate={{ x: -x.get() / 10, y: -y.get() / 10 }}
        transition={{ duration: 0.1 }}
      ></motion.div>
    </div>
  );
});

Minimap.displayName = 'Minimap';

export default Minimap;

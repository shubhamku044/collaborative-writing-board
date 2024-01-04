export interface CtxOptions {
  lineWidth: number;
  lineColor: string;
}

export interface ServerToClientEvents {
  socket_draw: (newMoves: [number, number][], options: CtxOptions) => void;
}

export interface ClientToServerEvents {
  draw: (newMoves: [number, number][], options: CtxOptions) => void;
}


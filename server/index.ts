import express, { Application } from 'express';
import { createServer } from 'http';
import next, { NextApiHandler, NextApiRequest } from 'next';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../src/common/types/types';

const port = parseInt(process.env.PORT || '3000');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  const app: Application = express();
  const server = createServer(app);

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server);

  io.on('connection', (socket) => {
    console.log('connection');

    socket.on('draw', (moves, opts) => {
      console.log('drawing');
      socket.broadcast.emit('socket_draw', moves, opts);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  app.get('/health', async (_, res) => {
    res.send('Healthy');
  });

  app.all('*', (req: NextApiRequest, res: any) => {
    nextHandler(req, res);
  });

  server.listen(port, () => {
    console.log(`Server is listining on port: ${port}`);
  });
});

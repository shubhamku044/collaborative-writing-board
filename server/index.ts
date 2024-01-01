import { createServer } from 'http';
import express, { Application } from 'express';
import next, { NextApiHandler, NextApiRequest } from 'next';

const port = parseInt(process.env.PORT || '3000');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  const app: Application = express();
  const server = createServer(app);

  app.all('*', (req: NextApiRequest, res: any) => {
    nextHandler(req, res);
  });

  server.listen(port, () => {
    console.log(`Server is listining on port: ${port}`);
  });
});

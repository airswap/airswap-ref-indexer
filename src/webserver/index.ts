import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Express } from 'express';
import { Server } from 'http';

const router = express.Router();

export class Webserver {
  private port: number;
  private server!: Server;

  constructor(port: number) {
    this.port = port;
  }

  run(): Express {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());

    app.use(router);

    this.server = app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });

    return app;
  }

  stop() {
    this.server.close();
  }
}

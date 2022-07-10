import bodyParser from "body-parser";
import cors from "cors";
import express, { Express } from "express";
import { Server } from 'http';
import { OrderController } from '../controller/OrderController.js';
import { PeersController } from './../controller/PeersController.js';
import { RootController } from './../controller/RootController.js';

const router = express.Router();

export class Webserver {
  private port: number
  private orderController: OrderController;
  private peersController: PeersController;
  private rootController: RootController;
  private server!: Server;
  private isDebugMode: boolean;

  constructor(port: number,
    orderController: OrderController,
    peersController: PeersController,
    rootController: RootController,
    isDebugMode: boolean) {
    this.port = port;
    this.orderController = orderController;
    this.peersController = peersController;
    this.rootController = rootController;
    this.isDebugMode = isDebugMode;
  }

  run(): Express {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());

    router.route("/peers/:peerUrl?")
      .get(this.peersController.getPeers)
      .post(this.peersController.addPeers)
      .delete(this.peersController.removePeer);

    if (this.isDebugMode) {
      router.route("/orders/:orderHash?")
        .get(this.orderController.getOrders)
        .post(this.orderController.addOrder)
        .delete(this.orderController.deleteOrder);
      router.route("/")
        .get(this.rootController.get);
    }

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

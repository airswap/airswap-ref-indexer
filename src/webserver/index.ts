import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { OrderController } from '../controller/OrderController.js';
import { PeersController } from './../controller/PeersController.js';
import { RootController } from './../controller/RootController.js';
import { RequestForQuote } from "./RequestForQuote.js";

const router = express.Router();

export class Webserver {
  private port: number
  private orderController: OrderController;
  private peersController: PeersController;
  private rootController: RootController;
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

  run() {
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

    new RequestForQuote(app, this.orderController, this.rootController).run();

    app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  };
}

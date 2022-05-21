import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { OrderController } from '../controller/OrderController.js';
import { HomeController } from './../controller/HomeController.js';
import { PeersController } from './../controller/PeersController.js';

const router = express.Router();

export class Webserver {
  private port: number
  private orderController: OrderController;
  private peersController: PeersController;
  private homeController: HomeController;

  constructor(port: number,
    orderController: OrderController,
    peersController: PeersController,
    homeController: HomeController) {
    this.port = port;
    this.orderController = orderController;
    this.peersController = peersController;
    this.homeController = homeController;
  }

  run() {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());

    router.route("/orders/:orderId?")
      .get(this.orderController.getOrders)
      .post(this.orderController.addOrder)
      .put(this.orderController.editOrder) // only available when debug mode is enabled to simulate mined event
    router.route("/peers/:peerUrl?")
      .get(this.peersController.getPeers)
      .post(this.peersController.addPeers)
      .delete(this.peersController.removePeer)
    router.route("/")
      .get(this.homeController.get)

    app.use(router);

    app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  };
}

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
      .get(this.orderController.getorders)
      .post(this.orderController.addOrder)
      .put(this.orderController.editOrder)
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

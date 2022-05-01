import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { EntryController } from './../controller/EntryController.js';
import { HomeController } from './../controller/HomeController.js';
import { PeersController } from './../controller/PeersController.js';

const router = express.Router();

export class Webserver {
  private port: number
  private entryController: EntryController;
  private peersController: PeersController;
  private homeController: HomeController;

  constructor(port: number,
    entryController: EntryController,
    peersController: PeersController,
    homeController: HomeController) {
    this.port = port;
    this.entryController = entryController;
    this.peersController = peersController;
    this.homeController = homeController;
  }

  run() {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());

    router.route("/entries/:entryId?")
      .get(this.entryController.getEntries)
      .post(this.entryController.addEntry)
      .put(this.entryController.editEntry)
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

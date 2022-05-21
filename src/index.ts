import "dotenv/config";
import publicIp from "public-ip";
import { BroadcastClient } from './client/BroadcastClient.js';
import { OrderClient } from './client/OrderClient.js';
import { PeersClient } from './client/PeersClient.js';
import { RegistryClient } from './client/RegistryClient.js';
import { HomeController } from './controller/HomeController.js';
import { OrderController } from './controller/OrderController.js';
import { PeersController } from './controller/PeersController.js';
import { InMemoryDatabase } from './database/InMemoryDatabase';
import { getLocalIp } from "./ip_helper.js";
import { Peers } from "./peer/Peers.js";
import { Webserver } from "./webserver/index.js";

// Env Variables
assertEnvironmentIsComplete();

// Configure host value 
const REGISTRY = process.env.REGISTRY!;
const EXPRESS_PORT = process.env.EXPRESS_PORT!;
const debugMode = process.env.DEBUG_ENABLED == "1";
const host = process.env.LOCAL_ONLY === "1" ? getLocalIp() + ":" + EXPRESS_PORT : (await publicIp.v4()) + ":" + EXPRESS_PORT;
console.log("HOST is", host);

// Injection
const orderClient = new OrderClient();
const peersClient = new PeersClient();
const broadcastClient = new BroadcastClient();
const registryClient = new RegistryClient(REGISTRY);
const database = new InMemoryDatabase();//new AceBaseClient("mydb");
const peers = new Peers(database, host, peersClient, broadcastClient);
const homeController = new HomeController(peers, database, REGISTRY);
const orderController = new OrderController(peers, database, debugMode);
const peersController = new PeersController(peers);

// Network register & synchronization 
const { data: peersFromRegistry } = await registryClient.getPeersFromRegistry();
await requestDataFromOtherPeer();
new Webserver(+EXPRESS_PORT, orderController, peersController, homeController).run();
registerInNetwork();

// Shutdown signals
process.on("SIGTERM", () => {
  gracefulShutdown();
});
process.on("SIGINT", () => {
  gracefulShutdown();
});

async function requestDataFromOtherPeer() {
  if (peersFromRegistry?.peers?.length > 0) {
    peers.addPeers(peersFromRegistry.peers);
    const peerUrl = "http://" + peers.getConnectablePeers()[0];
    console.log("Configure client");
    const { data } = await orderClient.getorders(peerUrl);
    database.addAll(data.orders);
    console.log("Asked all queries to", peerUrl);
  } else {
    console.log("/!\\ FIRST NODE AVAILABLE !");
  }
}

function registerInNetwork() {
  registryClient.sendIpToRegistry(host)
    .then(() => {
      peers.broadcastMyHostToOtherPeer();
      console.log("Ip sent to registry + broadcasted my host to other peers");
    })
    .catch((error) => {
      console.log("Could not send ip to registry", error);
      process.exit(4);
    });
}

function assertEnvironmentIsComplete() {
  if (!process.env.EXPRESS_PORT) {
    console.error("No express port defined");
    process.exit(2);
  }
  if (!process.env.REGISTRY) {
    console.error("No registry url defined");
    process.exit(3);
  }
}

async function gracefulShutdown() {
  try {
    await registryClient.removeIpFromRegistry(host);
  } catch (e) {
    console.log("Error while sending data to registry", e);
  }
  await database.close();
  await peers.broadcastDisconnectionToOtherPeer();
  process.exit(0);
}
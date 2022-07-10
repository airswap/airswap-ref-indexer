import "dotenv/config";
import publicIp from "public-ip";
import { OrderService } from './service/OrderService.js';
import { BroadcastClient } from './client/BroadcastClient.js';
import { OrderClient } from './client/OrderClient.js';
import { PeersClient } from './client/PeersClient.js';
import { RegistryClient } from './client/RegistryClient.js';
import { RootController } from './controller/RootController.js';
import { OrderController } from './controller/OrderController.js';
import { PeersController } from './controller/PeersController.js';
import { AceBaseClient } from './database/AcebaseClient.js';
import { InMemoryDatabase } from './database/InMemoryDatabase.js';
import { getLocalIp } from "./ip_helper.js";
import { Peers } from "./peer/Peers.js";
import { Webserver } from "./webserver/index.js";
import { RequestForQuote } from "./webserver/RequestForQuote.js";

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

const database = getDatabase();

const orderService = new OrderService(database);
const peers = new Peers(database, host, peersClient, broadcastClient);

const rootController = new RootController(peers, database, REGISTRY);
const orderController = new OrderController(peers, orderService, database);
const peersController = new PeersController(peers);

// Network register & synchronization 
const { data: peersFromRegistry } = await registryClient.getPeersFromRegistry();
await requestDataFromOtherPeer();
const webserver = new Webserver(+EXPRESS_PORT, orderController, peersController, rootController, debugMode).run();
new RequestForQuote(webserver, orderService, rootController).run();
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
    const { data } = await orderClient.getOrders(peerUrl);
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

function getDatabase() {
  const deleteDbOnStart = process.env.DELETE_DB_ON_START == "1";
  const databseType = process.env.DATABASE_TYPE;
  if (databseType === "ACEBASE") {
    return new AceBaseClient("airswapDb", deleteDbOnStart);
  } else if (databseType === "IN_MEMORY") {
    return new InMemoryDatabase();
  }
  console.error("Unknown database, check env file !")
  process.exit(5);
}
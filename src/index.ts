import "dotenv/config";
import publicIp from "public-ip";
import { Database } from './database/Database';
import { BroadcastClient } from './client/BroadcastClient.js';
import { OrderClient } from './client/OrderClient.js';
import { PeersClient } from './client/PeersClient.js';
import { RegistryClient } from './client/RegistryClient.js';
import { PeersController } from './controller/PeersController.js';
import { RootService } from './service/RootService.js';
import { AceBaseClient } from './database/AcebaseClient.js';
import { InMemoryDatabase } from './database/InMemoryDatabase.js';
import { getLocalIp } from "./ip_helper.js";
import { Peers } from "./peer/Peers.js";
import { OrderService } from './service/OrderService.js';
import { Webserver } from "./webserver/index.js";
import { RequestForQuote } from "./webserver/RequestForQuote.js";

// Env Variables
assertEnvironmentIsComplete();

// Configure host value 
const REGISTRY = process.env.REGISTRY!;
const EXPRESS_PORT = process.env.EXPRESS_PORT!;
const host = process.env.LOCAL_ONLY === "1" ? getLocalIp() + ":" + EXPRESS_PORT : (await publicIp.v4()) + ":" + EXPRESS_PORT;
console.log("HOST is", host);

// Injection
const orderClient = new OrderClient();
const peersClient = new PeersClient();
const broadcastClient = new BroadcastClient();
const registryClient = new RegistryClient(REGISTRY);

const database = await getDatabase();

const orderService = new OrderService(database);
const peers = new Peers(database, host, peersClient, broadcastClient);

const rootController = new RootService(peers, database, REGISTRY);
const peersController = new PeersController(peers);

// Network register & synchronization 
const { data: peersFromRegistry } = await registryClient.getPeersFromRegistry();
await requestDataFromOtherPeer();
const webserver = new Webserver(+EXPRESS_PORT, peersController);
const expressApp = webserver.run();
new RequestForQuote(expressApp, orderService, rootController, peers).run();
registerInNetwork();

// Shutdown signals
process.on("SIGTERM", () => {
  gracefulShutdown(webserver);
});
process.on("SIGINT", () => {
  gracefulShutdown(webserver);
});

async function requestDataFromOtherPeer() {
  if (peersFromRegistry?.peers?.length > 0) {
    peers.addPeers(peersFromRegistry.peers);
    const peerUrl = "http://" + peers.getConnectablePeers()[0];
    console.log("Configure client");
    const { data } = await orderClient.getOrders_JSON_RPC(peerUrl);
    console.log(data.orders);
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

async function gracefulShutdown(webserver: Webserver) {
  try {
    await registryClient.removeIpFromRegistry(host);
    await database.close();
    webserver.stop()
    await peers.broadcastDisconnectionToOtherPeer();
  } catch (e) {
    console.log("Error while sending data to registry", e);
  }
  process.exit(0);
}

async function getDatabase(): Promise<Database> {
  const deleteDbOnStart = process.env.DELETE_DB_ON_START == "1";
  const databseType = process.env.DATABASE_TYPE;
  if (databseType === "ACEBASE") {
    const acebaseClient = new AceBaseClient();
    await acebaseClient.connect("airswapDb", deleteDbOnStart);
    return Promise.resolve(acebaseClient);
  } else if (databseType === "IN_MEMORY") {
    const inMemoryDb = new InMemoryDatabase();
    await inMemoryDb.connect("airswapDb", deleteDbOnStart);
    return Promise.resolve(inMemoryDb);
  }
  console.error("Unknown database, check env file !")
  process.exit(5);
}
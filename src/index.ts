import "dotenv/config";
import { BroadcastClient } from './client/BroadcastClient.js';
import { getRegistry } from "./client/getRegistry.js";
import { requestDataFromOtherPeer } from "./client/requestDataFromOtherPeer.js";
import { Web3SwapClient } from './client/Web3SwapClient.js';
import { Database } from './database/Database';
import { getDatabase } from "./database/getDatabase.js";
import { getSwapAbi } from './indexers/index.js';
import { Peers } from "./peer/Peers.js";
import { OrderService } from './service/OrderService.js';
import { RootService } from './service/RootService.js';
import { Webserver } from "./webserver/index.js";
import { IndexerServer } from "./webserver/IndexerServer.js";

// Env Variables
if (!process.env.EXPRESS_PORT) {
  console.error("No express port defined");
  process.exit(2);
}

// Configure host value 
const EXPRESS_PORT = process.env.EXPRESS_PORT!;
const host = process.env.NODE_URL!;
console.log("HOST is", host);

// Injection
const broadcastClient = new BroadcastClient();

const database = await getDatabase(process.env.DELETE_DB_ON_START == "1", process.env.DATABASE_TYPE as string);
if (!database) {
  console.error("Unknown database, check env file !")
  process.exit(5);
}

const intervalId = setInterval(() => {
  const currentTimestampInSeconds = new Date().getTime() / 1000;
  database.deleteExpiredOrder(currentTimestampInSeconds);
}, 1000 * 60);

const orderService = new OrderService(database);
const peers = new Peers(database, host, broadcastClient);

const registryClient = getRegistry(process.env, peers);
if (registryClient === null) {
  process.exit(3);
}
const web3SwapClient = getWeb3SwapClient(database);
if (web3SwapClient === null) {
  console.log("Could connect to swap smart contract");
  process.exit(4);
}
const rootController = new RootService(peers, database, process.env.REGISTRY!);

// Network register & synchronization 
let peersFromRegistry = await registryClient.getPeersFromRegistry();
console.log("Available peers:", peersFromRegistry);

await requestDataFromOtherPeer(peersFromRegistry, database, peers);
const webserver = new Webserver(+EXPRESS_PORT);
const expressApp = webserver.run();
new IndexerServer(expressApp, orderService, rootController, peers).run();

// Shutdown signals
process.on("SIGTERM", () => {
  gracefulShutdown(webserver, database, intervalId);
});
process.on("SIGINT", () => {
  gracefulShutdown(webserver, database, intervalId);
});

function getWeb3SwapClient(database: Database) {
  const address: string = process.env.SWAP as string;
  const apiKey: string = process.env.API_KEY as string;
  const network: string = process.env.NETWORK as string;
  return new Web3SwapClient(apiKey, address, getSwapAbi(), network, database);
}

async function gracefulShutdown(webserver: Webserver, database: Database, intervalId: NodeJS.Timer) {
  try {
    clearInterval(intervalId);
    await database.close();
    webserver.stop()
  } catch (e) {
    console.log("Error while sending data to registry", e);
  }
  process.exit(0);
}

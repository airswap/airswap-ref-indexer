import "dotenv/config";
import { isNumeric } from "./validator/index.js";
import { BroadcastClient } from './client/BroadcastClient.js';
import { getRegistry } from "./client/getRegistry.js";
import { requestDataFromOtherPeer } from "./client/requestDataFromOtherPeer.js";
import { Web3SwapERC20Client } from './client/Web3SwapERC20Client.js';
import { Database } from './database/Database';
import { getDatabase } from "./database/getDatabase.js";
import { Peers } from "./peer/Peers.js";
import { OrderService } from './service/OrderService.js';
import { RootService } from './service/RootService.js';
import { Webserver } from "./webserver/index.js";
import { IndexerServer } from "./webserver/IndexerServer.js";
import { Web3SwapClient } from "./client/Web3SwapClient.js";

// Env Variables
if (!process.env.EXPRESS_PORT) {
  console.error("No express port defined");
  process.exit(2);
}
if (!(process.env.NETWORK && isNumeric(process.env.NETWORK))) {
  if (!process.env.EXPRESS_PORT) {
    console.error("No Network defined");
    process.exit(2);
  }
}
const network = +process.env.NETWORK!;

// Configure host value 
const EXPRESS_PORT = process.env.EXPRESS_PORT!;
const host = process.env.NODE_URL!;
console.log("HOST is", host);

// Injection
const broadcastClient = new BroadcastClient();

const database = await getDatabase(process.env.DELETE_DB_ON_START == "1", process.env.DATABASE_TYPE as string, process.env.DATABASE_PATH as string);
if (!database) {
  console.error("Unknown database, check env file !")
  process.exit(5);
}

const intervalId = setInterval(() => {
  const currentTimestampInSeconds = new Date().getTime() / 1000;
  database.deleteExpiredOrderERC20(currentTimestampInSeconds);
  database.deleteExpiredOrder(currentTimestampInSeconds);
}, 1000 * 60);

const swapClients = await getWeb3SwapClient(database, network);
if (swapClients?.swapClientOrderERC20 === null) {
  console.log("Could connect to SwapERC20 smart contract");
  process.exit(4);
}

if (swapClients?.swapClientOrder === null) {
  console.log("Could connect to Smart contract");
  process.exit(4);
}

if (!isNumeric(process.env.MAX_RESULTS_FOR_QUERY)) {
  console.log("MAX_RESULTS_FOR_QUERY not set");
  process.exit(6);
}

const orderService = new OrderService(database, swapClients!.swapClientOrderERC20, swapClients!.swapClientOrder, +process.env.MAX_RESULTS_FOR_QUERY!);
const peers = new Peers(database, host, broadcastClient);

const registryClient = getRegistry(process.env, peers);
if (registryClient === null) {
  process.exit(3);
}

const rootController = new RootService(peers, database, network);

// Network register & synchronization 
let peersFromRegistry: string[] = await registryClient.getPeersFromRegistry();
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

async function getWeb3SwapClient(database: Database, network: number) {
  if (!network) {
    return null;
  }
  const apiKey: string = process.env.API_KEY as string;

  const swapClientOrderERC20 = new Web3SwapERC20Client(apiKey, database);
  const swapClientOrder = new Web3SwapClient(apiKey, database);

  await swapClientOrder.connectToChain(network);
  await swapClientOrderERC20.connectToChain(network);
  const previsousChainObserved = await database.getAllChainIds()
  if (previsousChainObserved.length > 0) {
    previsousChainObserved.forEach(async chainId => {
      await swapClientOrder.connectToChain(chainId);
      await swapClientOrderERC20.connectToChain(chainId);
    })
  }
  return { swapClientOrder, swapClientOrderERC20 };
}

async function gracefulShutdown(webserver: Webserver, database: Database, intervalId: NodeJS.Timeout) {
  try {
    clearInterval(intervalId);
    await database.close();
    webserver.stop()
  } catch (e) {
    console.log("Error while sending data to registry", e);
  }
  process.exit(0);
}

import "dotenv/config";
import { ContractInterface } from 'ethers';
import publicIp from "public-ip";
import { BroadcastClient } from './client/BroadcastClient.js';
import { HttpRegistryClient } from './client/HttpRegistryClient.js';
import { OrderClient } from './client/OrderClient.js';
import { PeersClient } from './client/PeersClient.js';
import { RegistryClient } from './client/RegistryClient';
import { Web3RegistryClient } from './client/Web3RegistryClient.js';
import { PeersController } from './controller/PeersController.js';
import { AceBaseClient } from './database/AcebaseClient.js';
import { Database } from './database/Database';
import { InMemoryDatabase } from './database/InMemoryDatabase.js';
import { getLocalIp } from "./ip_helper.js";
import { Peers } from "./peer/Peers.js";
import { OrderService } from './service/OrderService.js';
import { RootService } from './service/RootService.js';
import { Webserver } from "./webserver/index.js";
import { RequestForQuote } from "./webserver/RequestForQuote.js";

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Indexers = require('@airswap/indexers/build/contracts/Indexers.sol/Indexers.json');

// Env Variables
if (!process.env.EXPRESS_PORT) {
  console.error("No express port defined");
  process.exit(2);
}

const useSmartContract: boolean = process.env.USE_SMART_CONTRACT == "1";

// Configure host value 
const EXPRESS_PORT = process.env.EXPRESS_PORT!;
const host = process.env.LOCAL_ONLY === "1" ? getLocalIp() + ":" + EXPRESS_PORT : (await publicIp.v4()) + ":" + EXPRESS_PORT;
console.log("HOST is", host);

// Injection
const orderClient = new OrderClient();
const peersClient = new PeersClient();
const broadcastClient = new BroadcastClient();

const database = await getDatabase();

const orderService = new OrderService(database);
const peers = new Peers(database, host, peersClient, broadcastClient, useSmartContract);

const peersController = new PeersController(peers);
const registryClient = getRegistry(useSmartContract, process.env, peers);
const rootController = new RootService(peers, database, process.env.REGISTRY!);

// Network register & synchronization 
let peersFromRegistry = await registryClient.getPeersFromRegistry();
console.log("Available peers:", peersFromRegistry);

await requestDataFromOtherPeer(peersFromRegistry);
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

async function requestDataFromOtherPeer(peersFromRegistry: string[]) {
  if (peersFromRegistry.length > 0) {
    try {
      peers.addPeers(peersFromRegistry);
      const peerUrl = peers.getConnectablePeers()[0];
      console.log("Configure client");
      const { data } = await orderClient.getOrders(peerUrl);
      console.log(data.orders);
      database.addAll(data.orders);
      console.log("Asked all queries to", peerUrl);
    } catch (err) {
      console.log("Could not connect to peer...");
    }
  } else {
    console.log("/!\\ FIRST NODE AVAILABLE !");
  }
}

function registerInNetwork() {
  registryClient.sendIpToRegistry(host)
    .then(() => {
      peers.broadcastMyHostToOtherPeer();
    })
    .catch((error) => {
      console.log("Could not send ip to registry", error);
      process.exit(4);
    });
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

function getRegistry(useSmartContract: boolean, conf: any, peers: Peers): RegistryClient {
  const address: string = conf.REGISTRY;
  const apiKey: string = conf.API_KEY;
  const network: string = conf.NETWORK;

  if (!address) {
    console.error("No registry address defined");
    process.exit(3);
  }

  if (useSmartContract) {
    if (!apiKey || !network) {
      console.error("Invalid registry configuration, apiKey, or network are incorrect, check env file !")
      process.exit(7);
    }
    return new Web3RegistryClient(apiKey, address, Indexers.abi as unknown as ContractInterface, network, peers);
  } else {
    return new HttpRegistryClient(address);
  }
}
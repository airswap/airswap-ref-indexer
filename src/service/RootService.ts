import { Database } from "../database/Database.js";
import { Peers } from "../peer/Peers.js";
import { HealthCheckResponse } from "../model/response/HealthCheckResponse.js";
import { RegistryV4 } from "@airswap/libraries";
import { Web3RegistryClient } from "client/Web3RegistryClient.js";

export class RootService {
    private peers: Peers;
    private regitryClient: Web3RegistryClient;
    private database: Database;

    constructor(peers: Peers, database: Database, regitryClient: Web3RegistryClient) {
        this.peers = peers;
        this.regitryClient = regitryClient;
        this.database = database;
    }

    public async get(): Promise<HealthCheckResponse> {
        const ordersERC20 = await this.database.getOrdersERC20();
        const orders = await this.database.getOrders();
        const chains = this.regitryClient.getConnectedChains();
        const registry = chains.reduce(
            (all, chainId) => {
                const addr = RegistryV4.addresses[+chainId];
                all[chainId] = addr;
                return all;
            },
            {} as Record<string, string>
        );

        return {
            peers: this.peers.getConnectablePeers(),
            networks: chains,
            registry: registry,
            databaseOrdersERC20: Object.keys(ordersERC20.orders).length,
            databaseOrders: Object.keys(orders.orders).length
        };
    }
}

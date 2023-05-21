import { Database } from '../database/Database.js';
import { Peers } from '../peer/Peers.js';
import { HealthCheckResponse } from '../model/response/HealthCheckResponse.js';
import { Registry } from '@airswap/libraries';

export class RootService {

    private peers: Peers;
    private network: number;
    private database: Database;

    constructor(peers: Peers, database: Database, network: number) {
        this.peers = peers;
        this.network = network;
        this.database = database;
    }

    public async get(): Promise<HealthCheckResponse> {
        const ordersERC20 = await this.database.getOrdersERC20();
        const orders = await this.database.getOrders();
        return {
            peers: this.peers.getPeers(),
            network: this.network,
            registry: Registry.addresses[this.network],
            databaseOrdersERC20: ordersERC20.ordersForQuery,
            databaseOrders: orders.ordersForQuery 
        }
    }

}
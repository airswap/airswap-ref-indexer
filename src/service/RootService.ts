import { Database } from '../database/Database.js';
import { Peers } from '../peer/Peers.js';
import { HealthCheckResponse } from '../client/getHealthCheck.js';
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
        const orders = await this.database.getOrdersERC20();
        return {
            peers: this.peers.getPeers(),
            registry: Registry.addresses[this.network],
            databaseOrders: orders.ordersForQuery
        }
    }

}
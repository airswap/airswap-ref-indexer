import { Database } from '../database/Database.js';
import { Peers } from '../peer/Peers.js';
import { HealthCheckResponse } from '@airswap/libraries/build/src/Indexer.js';
export class RootService {

    private peers: Peers;
    private registry: string;
    private database: Database;

    constructor(peers: Peers, database: Database, registry: string) {
        this.peers = peers;
        this.registry = registry;
        this.database = database;
    }

    public async get(): Promise<HealthCheckResponse> {
        const orders = await this.database.getOrders();
        return {
            peers: this.peers.getPeers(),
            registry: this.registry,
            databaseOrders: orders.ordersForQuery
        }
    }

}
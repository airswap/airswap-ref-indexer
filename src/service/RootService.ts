import { Database } from '../database/Database.js';
import { Peers } from '../peer/Peers.js';
import { HealthCheckResponse } from './../model/response/HealthCheckResponse.js';
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
        return new HealthCheckResponse(this.peers.getPeers(), this.registry, orders.ordersForQuery);
    }

}
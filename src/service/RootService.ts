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
        const ordersERC20 = await this.database.getOrdersERC20();
        const orders = await this.database.getOrdersMarketPlace();
        return {
            peers: this.peers.getPeers(),
            network: this.network,
            registry: Registry.addresses[this.network],
            databaseOrders: ordersERC20.ordersForQuery +  orders.ordersForQuery 
        }
    }

}
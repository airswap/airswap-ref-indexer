import { Request, Response } from 'express';
import { Database } from '../database/Database.js';
import { Peers } from '../peer/Peers.js';
export class RootController {

    private peers: Peers;
    private registry: string;
    private database: Database;

    constructor(peers: Peers, database: Database, registry: string) {
        this.peers = peers;
        this.registry = registry;
        this.database = database;
    }

    async get(request: Request, response: Response) {
        console.log("R<---", request.method, request.url, request.body);
        const result = await this.getService();
        response.json(result);
    }

    public async getService() {
        const orders = await this.database.getOrders();
        return {
            peers: this.peers.getPeers(),
            registry: this.registry,
            database: orders,
        };
    }

}
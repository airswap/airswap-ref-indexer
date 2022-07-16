import { Peers } from './../../peer/Peers';

export class HealthCheckResponse {
    public peers: string[];
    public registry: string;
    public databaseOrders: number;

    constructor(peers: string[], registry: string, databaseOrders: number) {
        this.peers = peers;
        this.registry = registry;
        this.databaseOrders = databaseOrders;
    }
}

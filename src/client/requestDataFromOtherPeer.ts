import { Database } from '../database/Database.js';
import { Peers } from './../peer/Peers.js';
import { OrderClient } from './OrderClient.js';

export async function requestDataFromOtherPeer(peersFromRegistry: string[], database: Database, peers: Peers, orderClient: OrderClient) {
    if (peersFromRegistry.length > 0) {
        peers.addPeers(peersFromRegistry);
    }

    if (peers.getConnectablePeers().length > 0) {
        try {
            const peerUrl = peers.getConnectablePeers()[0];
            console.log("Configure client");
            const { data } = await orderClient.getOrders(peerUrl);
            await database.addAll(data.orders);
            console.log("Asked all queries to", peerUrl);
        } catch (err) {
            console.log("Could not connect to peer...");
        }
    } else {
        console.log("/!\\ FIRST NODE AVAILABLE !");    
    }
    return Promise.resolve();
}

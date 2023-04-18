import { Server } from '@airswap/libraries';
import { Database } from '../database/Database.js';
import { mapAllIndexedOrderResponseToDbOrder } from '../mapper/mapIndexedOrderResponseToDbOrder.js';
import { Peers } from './../peer/Peers.js';

export async function requestDataFromOtherPeer(peersFromRegistry: string[], database: Database, peers: Peers) {
    if (peersFromRegistry.length > 0) {
        peers.addPeers(peersFromRegistry);
    }
    const peerUrls = peers.getConnectablePeers();
    for (let peerUrl of peerUrls) {
        try {
            const server = await Server.at(peerUrl);
            const { orders } = await server.getOrdersERC20();
            await database.addAll(mapAllIndexedOrderResponseToDbOrder(orders));
            console.log("Asked all queries to", peerUrl);
            return Promise.resolve();
        } catch (err) {
            console.warn("Could not connect to peer", peerUrl);
        }
    }
    console.log("/!\\ FIRST NODE AVAILABLE !");
    return Promise.resolve();
}

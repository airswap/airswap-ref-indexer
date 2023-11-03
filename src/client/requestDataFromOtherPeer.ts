import { Server } from '@airswap/libraries';
import { Database } from '../database/Database.js';
import { mapAllIndexedOrderResponseToDbOrderERC20 } from '../mapper/mapIndexedOrderResponseToDbOrderERC20.js';
import { mapAllIndexedOrderResponseToDbOrder } from '../mapper/mapIndexedOrderResponseToDbOrder.js';
import { Peers } from './../peer/Peers.js';

export async function requestDataFromOtherPeer(peersFromRegistry: string[], database: Database, peers: Peers) {
    if (peersFromRegistry.length > 0) {
        peers.addPeers(peersFromRegistry);
    }
    const peerUrls = peers.getConnectablePeers();
    for (const peerUrl of peerUrls) {
        try {
            const server = await Server.at(peerUrl);
            const erc20Orders = await server.getOrdersERC20({ offset: 0, limit: -1 });
            const orders = await server.getOrders({ offset: 0, limit: -1 });
            if (erc20Orders && orders) {
                await database.addAllOrderERC20(mapAllIndexedOrderResponseToDbOrderERC20(erc20Orders.orders));
                await database.addAllOrder(mapAllIndexedOrderResponseToDbOrder(orders.orders));
                console.log("Asked all queries to", peerUrl);
                return Promise.resolve();
            } else {
                console.warn("No values from peer", peerUrl);
            }
        } catch (err) {
            console.warn("Could not connect to peer", peerUrl, err);
        }
    }
    console.log("/!\\ FIRST NODE AVAILABLE !");
    return Promise.resolve();
}

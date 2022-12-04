import { NodeIndexer } from '@airswap/libraries';
import { IndexedOrder } from 'model/IndexedOrder.js';
import { Database } from '../database/Database.js';
import { mapIndexedOrderResponseToDbOrder } from '../mapper/mapIndexedOrderResponseToDbOrder.js';
import { Peers } from './../peer/Peers.js';

export async function requestDataFromOtherPeer(peersFromRegistry: string[], database: Database, peers: Peers) {
    if (peersFromRegistry.length > 0) {
        peers.addPeers(peersFromRegistry);
    }
    const peerUrls = peers.getConnectablePeers();
    for(let index = 0; index < peerUrls.length; index++) {
        const peerUrl = peerUrls[index];
        try {
            console.log("Requesting from", peerUrl);
            const data = await new NodeIndexer(peerUrl).getOrders();
            const { orders } = data;
            const toAdd: Record<string, IndexedOrder> = Object.values(orders).reduce((indexedOrders, indexedOrderResponse) => {
                const indexedOrder = mapIndexedOrderResponseToDbOrder(indexedOrderResponse);                
                return indexedOrder ? {...indexedOrders, ...indexedOrder} : indexedOrders;
            }, {});
            await database.addAll(toAdd);
            console.log("Asked all queries to", peerUrl);
            return Promise.resolve();
        } catch (err) {
            console.warn("Could not connect to peer", peerUrl);
        }
    }
    console.log("/!\\ FIRST NODE AVAILABLE !");          
    return Promise.resolve();
}

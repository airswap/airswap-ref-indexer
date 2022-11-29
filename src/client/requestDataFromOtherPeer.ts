import { NodeIndexer } from '@airswap/libraries';
import { IndexedOrder } from 'model/IndexedOrder.js';
import { Database } from '../database/Database.js';
import { mapAnyToDbOrder } from '../mapper/mapAnyToDbOrder.js';
import { Peers } from './../peer/Peers.js';

export async function requestDataFromOtherPeer(peersFromRegistry: string[], database: Database, peers: Peers) {
    if (peersFromRegistry.length > 0) {
        peers.addPeers(peersFromRegistry);
    }

    if (peers.getConnectablePeers().length > 0) {
        try {
            const peerUrl = peers.getConnectablePeers()[0];
            console.log("Configure client");
            const { orders } = await new NodeIndexer(peerUrl).getOrders();
            
            const toAdd: Record<string, IndexedOrder> = Object.values(orders).reduce((indexedOrders, indexedOrderResponse) => {
                const indexedOrder: Record<string, IndexedOrder> = {};  
                //TODO Extract dedicated mapper :)
                indexedOrder[indexedOrderResponse.hash!] =  new IndexedOrder(mapAnyToDbOrder(indexedOrderResponse), indexedOrderResponse.addedOn, indexedOrderResponse.hash);
                return {...indexedOrders, indexedOrder};                
            },{});
            await database.addAll(toAdd);
            console.log("Asked all queries to", peerUrl);
        } catch (err) {
            console.log("Could not connect to peer...");
        }
    } else {
        console.log("/!\\ FIRST NODE AVAILABLE !");    
    }
    return Promise.resolve();
}

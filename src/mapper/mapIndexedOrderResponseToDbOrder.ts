import { IndexedOrderResponse } from '@airswap/libraries';
import { IndexedOrder } from '../model/IndexedOrder.js';
import { mapAnyToDbOrder } from './mapAnyToDbOrder.js';


function mapIndexedOrderResponseToDbOrder(indexedOrderResponse: IndexedOrderResponse): Record<string, IndexedOrder> | undefined {
    if(!indexedOrderResponse) return undefined;

    const { order, hash, addedOn} = indexedOrderResponse;
    if(!order || !hash || !addedOn) return undefined;
    
    const indexedOrder: Record<string, IndexedOrder> = {};  
    indexedOrder[hash] = new IndexedOrder(mapAnyToDbOrder(order), addedOn, hash);
    return indexedOrder;
}

export function mapAllIndexedOrderResponseToDbOrder(orders: Record<string, IndexedOrderResponse>): Record<string, IndexedOrder> {
    const mapped: Record<string, IndexedOrder> = Object.values(orders).reduce((indexedOrders, indexedOrderResponse) => {
        const indexedOrder = mapIndexedOrderResponseToDbOrder(indexedOrderResponse);
        return indexedOrder ? {...indexedOrders, ...indexedOrder} : indexedOrders;
    }, {});
    return mapped;
}
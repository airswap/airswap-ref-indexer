import { IndexedOrder as IndexedOrderResponse } from '@airswap/types';
import { IndexedOrder } from '../model/IndexedOrder.js';
import { FullOrder } from '@airswap/types';
import { DbOrderMarketPlace } from 'model/DbOrderTypes.js';
import { mapAnyToDbOrderMarketPlace } from './mapAnyToDbOrder.js';


function mapIndexedOrderResponseToDbOrderMarketPlace(indexedOrderResponse: IndexedOrderResponse<FullOrder>): Record<string, IndexedOrder<DbOrderMarketPlace>> | undefined {
    if (!indexedOrderResponse) return undefined;

    const { order, hash, addedOn } = indexedOrderResponse;
    if (!order || !hash || !addedOn) return undefined;

    const indexedOrder: Record<string, IndexedOrder<DbOrderMarketPlace>> = {};
    indexedOrder[hash] = new IndexedOrder(mapAnyToDbOrderMarketPlace(order), addedOn, hash);
    return indexedOrder;
}

export function mapAllIndexedOrderResponseToDbOrderMarketPlace(orders: Record<string, IndexedOrderResponse<FullOrder>>): Record<string, IndexedOrder<DbOrderMarketPlace>> {
    const mapped: Record<string, IndexedOrder<DbOrderMarketPlace>> = Object.values(orders).reduce((indexedOrders, indexedOrderResponse) => {
        const indexedOrder = mapIndexedOrderResponseToDbOrderMarketPlace(indexedOrderResponse);
        return indexedOrder ? { ...indexedOrders, ...indexedOrder } : indexedOrders;
    }, {});
    return mapped;
}
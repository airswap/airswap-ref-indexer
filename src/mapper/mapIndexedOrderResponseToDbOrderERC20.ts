import { IndexedOrder as IndexedOrderResponse } from '@airswap/types';
import { IndexedOrder } from '../model/IndexedOrder.js';
import { FullOrderERC20 } from '@airswap/types';
import { mapAnyToDbOrderERC20 } from './mapAnyToDbOrderERC20.js';
import { DbOrderERC20 } from 'model/DbOrderTypes.js';


function mapIndexedOrderResponseToDbOrderERC20(indexedOrderResponse: IndexedOrderResponse<FullOrderERC20>): Record<string, IndexedOrder<DbOrderERC20>> | undefined {
    if(!indexedOrderResponse) return undefined;

    const { order, hash, addedOn} = indexedOrderResponse;
    if(!order || !hash || !addedOn) return undefined;
    
    const indexedOrder: Record<string, IndexedOrder<DbOrderERC20>> = {};  
    indexedOrder[hash] = new IndexedOrder(mapAnyToDbOrderERC20(order), addedOn, hash);
    return indexedOrder;
}

export function mapAllIndexedOrderResponseToDbOrderERC20(orders: Record<string, IndexedOrderResponse<FullOrderERC20>>): Record<string, IndexedOrder<DbOrderERC20>> {
    const mapped: Record<string, IndexedOrder<DbOrderERC20>> = Object.values(orders).reduce((indexedOrders, indexedOrderResponse) => {
        const indexedOrder = mapIndexedOrderResponseToDbOrderERC20(indexedOrderResponse);
        return indexedOrder ? {...indexedOrders, ...indexedOrder} : indexedOrders;
    }, {});
    return mapped;
}
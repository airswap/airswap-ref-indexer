import { IndexedOrder } from "@airswap/types";
import { FullOrder } from "@airswap/types";
import { DbOrder } from "model/DbOrderTypes.js";
import { mapAnyToDbOrder } from "./mapAnyToDbOrder.js";

function mapIndexedOrderResponseToDbOrder(indexedOrderResponse: IndexedOrder<FullOrder>): Record<string, IndexedOrder<DbOrder>> | undefined {
    if (!indexedOrderResponse) return undefined;

    const { order, hash, addedOn } = indexedOrderResponse;
    if (!order || !hash || !addedOn) return undefined;

    const indexedOrder: Record<string, IndexedOrder<DbOrder>> = {};
    indexedOrder[hash] = { order: mapAnyToDbOrder(order), addedOn, hash };
    return indexedOrder;
}

export function mapAllIndexedOrderResponseToDbOrder(orders: Record<string, IndexedOrder<FullOrder>>): Record<string, IndexedOrder<DbOrder>> {
    const mapped: Record<string, IndexedOrder<DbOrder>> = Object.values(orders).reduce((indexedOrders, indexedOrderResponse) => {
        const indexedOrder = mapIndexedOrderResponseToDbOrder(indexedOrderResponse);
        return indexedOrder ? { ...indexedOrders, ...indexedOrder } : indexedOrders;
    }, {});
    return mapped;
}

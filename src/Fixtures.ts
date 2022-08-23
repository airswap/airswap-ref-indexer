import { JsonRpcResponse } from './model/response/JsonRpcResponse';
import { Order } from '@airswap/typescript';
import { DbOrder } from './model/DbOrder.js';
import { Pagination } from './model/Pagination.js';
import { Filters } from './database/filter/Filters';
import { IndexedOrder } from './model/IndexedOrder';
import { OrderResponse } from './model/response/OrderResponse';

export function forgeIndexedOrder(expectedAddedDate = new Date().getTime(), expiryDate = new Date().getTime() + 10) {
    return new IndexedOrder(forgeDbOrder(expiryDate), expectedAddedDate, "hash");
}

export function forgeDbOrder(expiryDate: number): DbOrder {
    return {
        nonce: "nonce",
        expiry: expiryDate,
        signerWallet: "signerWallet",
        signerToken: "dai",
        signerAmount: "5",
        approximatedSignerAmount: 5,
        senderToken: "ETH",
        senderAmount: "10",
        approximatedSenderAmount: 10,
        v: "v",
        r: "r",
        s: "s",
        chainId: "5",
        swapContract: "0x0000000000000000000000000000000000000000"
    };
}


export function forgeOrder(expiryDate: number): Order {
    return {
        nonce: "nonce",
        expiry: `${expiryDate}`,
        signerWallet: "signerWallet",
        signerToken: "dai",
        signerAmount: "5",
        senderToken: "ETH",
        senderAmount: "10",
        v: "v",
        r: "r",
        s: "s"
    };
}

export function forgeOrderResponse(filters?: Filters): OrderResponse {
    return new OrderResponse({
        aze: {
            addedOn: 1653900784696,
            hash: "hash",
            order: forgeDbOrder(1653900784706),
        },
    }, new Pagination("1", "1"), 1, filters);
}

export function forgeJsonRpcResponse(id: string, response: OrderResponse): JsonRpcResponse {
    return new JsonRpcResponse(id, response);
}
import { AddressZero } from '@ethersproject/constants';
import { JsonRpcResponse } from './model/response/JsonRpcResponse';
import { FullOrder } from '@airswap/typescript';
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
        signerWallet: AddressZero,
        signerToken: AddressZero,
        signerAmount: "5",
        approximatedSignerAmount: 5,
        senderToken: AddressZero,
        senderAmount: "10",        
        protocolFee: "4",
        senderWallet: AddressZero,
        approximatedSenderAmount: 10,
        r: "0x3e1010e70f178443d0e3437464db2f910be150259cfcbe8916a6267247bea0f7",
        s: "0x5a12fdf12c2b966a98d238916a670bdfd83e207e54a9c7d0af923839582de79f",
        v: "28",
        chainId: "5",
        swapContract: AddressZero
    };
}


export function forgeFullOrder(expiryDate: number): FullOrder {
    return {
        nonce: "nonce",
        expiry: `${expiryDate}`,
        signerWallet: AddressZero,
        signerToken: AddressZero,
        signerAmount: "5",
        senderToken: AddressZero,
        senderAmount: "10",
        protocolFee: "4",
        senderWallet: AddressZero,
        r: "0x3e1010e70f178443d0e3437464db2f910be150259cfcbe8916a6267247bea0f7",
        s: "0x5a12fdf12c2b966a98d238916a670bdfd83e207e54a9c7d0af923839582de79f",
        v: "28",
        chainId: "5",
        swapContract: AddressZero
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
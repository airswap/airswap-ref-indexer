import { AddressZero } from '@ethersproject/constants';
import { JsonRpcResponse } from './model/response/JsonRpcResponse';
import { FullOrder, Order } from '@airswap/typescript';
import { IndexedOrderResponse } from './model/response/IndexedOrderResponse';
import { FiltersResponse } from './database/filter/FiltersResponse';
import { DbOrder } from './model/DbOrder.js';
import { IndexedOrder } from './model/IndexedOrder';
import { Pagination } from './model/Pagination.js';
import { OrderResponse } from './model/response/OrderResponse';

export function forgeIndexedOrder(expectedAddedDate: number, expiryDate: number) {
    return new IndexedOrder(forgeDbOrder(expiryDate), expectedAddedDate, "hash");
}

export function forgeIndexedOrderResponse(expectedAddedDate: number, expiryDate: number) {
    return new IndexedOrderResponse(forgeOrder(expiryDate), expectedAddedDate, "hash");
}

export function forgeDbOrder(expiryDate: number): DbOrder {
    return {
        nonce: "nonce",
        expiry: expiryDate/1000,
        signerWallet: AddressZero,
        signerToken: AddressZero,
        signerAmount: "5",
        senderToken: AddressZero,
        senderAmount: "10",        
        protocolFee: "4",
        senderWallet: AddressZero,
        approximatedSignerAmount: BigInt(5),
        approximatedSenderAmount: BigInt(10),
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
        expiry: `${expiryDate/1000}`,
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

export function forgeOrderResponse(filters?: FiltersResponse): OrderResponse {
    return new OrderResponse({
        aze: {
            addedOn: 1653900784696,
            hash: "hash",
            order: forgeOrder(1653900784706),
        },
    }, new Pagination("1", "1"), 1, filters);
}

export function forgeJsonRpcResponse(id: string, response: OrderResponse): JsonRpcResponse {
    return new JsonRpcResponse(id, response);
}

export function forgeOrder(expiryDate: number): Order {
    return {
        nonce: "nonce",
        expiry: `${expiryDate/1000}`,
        signerWallet: AddressZero,
        signerToken: AddressZero,
        signerAmount: "5",
        senderToken: AddressZero,
        senderAmount: "10",
        r: "0x3e1010e70f178443d0e3437464db2f910be150259cfcbe8916a6267247bea0f7",
        s: "0x5a12fdf12c2b966a98d238916a670bdfd83e207e54a9c7d0af923839582de79f",
        v: "28",
    };
}

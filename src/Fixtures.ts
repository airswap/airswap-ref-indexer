import { IndexedOrder as IndexedOrderResponse, OrderResponse, FiltersResponse } from '@airswap/types';
import { FullOrderERC20 } from '@airswap/typescript';
import { AddressZero } from '@ethersproject/constants';
import { DbOrder } from './model/DbOrder.js';
import { IndexedOrder } from './model/IndexedOrder';
import { JsonRpcResponse } from '@airswap/libraries';

export function forgeIndexedOrder(expectedAddedDate: number, expiryDate: number): IndexedOrder {
    return new IndexedOrder(forgeDbOrder(expiryDate), expectedAddedDate, "hash");
}

export function forgeIndexedOrderResponse(expectedAddedDate: number, expiryDate: number): IndexedOrderResponse<FullOrderERC20> {
    return {
        hash: "hash",
        addedOn: expectedAddedDate,
        order: forgeFullOrderERC20(expiryDate)
    }
}

export function forgeDbOrder(expiryDate: number): DbOrder {
    return {
        nonce: "nonce",
        expiry: expiryDate / 1000,
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
        chainId: 5,
        swapContract: AddressZero
    };
}


export function forgeFullOrderERC20(expiryDate: number): FullOrderERC20 {
    return {
        nonce: "nonce",
        expiry: `${expiryDate / 1000}`,
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
        chainId: 5,
        swapContract: AddressZero
    };
}

export function forgeOrderResponse(filters?: FiltersResponse): OrderResponse<FullOrderERC20> {
    return {
        orders: {
            aze: {
                addedOn: 1653900784696,
                hash: "hash",
                order: forgeFullOrderERC20(1653900784706),
            },
        },
        pagination: {
            first: "1",
            last: "1"
        },
        ordersForQuery: 1,
        filters: filters
    }
}

export function forgeJsonRpcResponse(id: string, response: OrderResponse<FullOrderERC20>): JsonRpcResponse<FullOrderERC20> {
    return new JsonRpcResponse(id, response);
}

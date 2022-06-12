import { Order } from '@airswap/typescript';
import { toNumber } from '../converter/index.js';

export function mapAnyToOrder(data: any): Order {
    if (!data || typeof data != 'object') {
        return undefined;
    }

    return {
        nonce: data.nonce,
        //@ts-ignore
        expiry: toNumber(data.expiry),
        signerWallet: data.signerWallet,
        signerToken: data.signerToken,
        //@ts-ignore
        signerAmount: toNumber(data.signerAmount),
        senderToken: data.senderToken,
        //@ts-ignore
        senderAmount: toNumber(data.senderAmount),
        r: data.r,
        s: data.s,
        v: data.v
    }
}
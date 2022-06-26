import { DbOrder } from 'model/DbOrder.js';
import { toNumber } from '../converter/index.js';

export function mapAnyToDbOrder(data: any): DbOrder {
    if (!data || typeof data != 'object') {
        return undefined;
    }

    return {
        nonce: data.nonce,
        expiry: toNumber(data.expiry),
        signerWallet: data.signerWallet,
        signerToken: data.signerToken,
        signerAmount: data.signerAmount,
        approximatedSignerAmount: toNumber(data.signerAmount),
        senderToken: data.senderToken,
        senderAmount: data.senderAmount,
        approximatedSenderAmount: toNumber(data.senderAmount),
        r: data.r,
        s: data.s,
        v: data.v
    }
}

export function mapAnyToOrder(data: any): DbOrder {
    if (!data || typeof data != 'object') {
        return undefined;
    }

    return {
        nonce: data.nonce,
        expiry: toNumber(data.expiry),
        signerWallet: data.signerWallet,
        signerToken: data.signerToken,
        signerAmount: data.signerAmount,
        approximatedSignerAmount: toNumber(data.approximatedSignerAmount),
        senderToken: data.senderToken,
        senderAmount: data.senderAmount,
        approximatedSenderAmount: toNumber(data.approximatedSenderAmount),
        r: data.r,
        s: data.s,
        v: data.v
    }
}
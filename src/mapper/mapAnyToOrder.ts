import { Order } from '@airswap/typescript';

export function mapAnyToOrder(data: any): Order {
    return {
        nonce: data.nonce,
        expiry: data.expiry,
        signerWallet: data.signerWallet,
        signerToken: data.signerToken,
        signerAmount: data.signerAmount,
        senderToken: data.senderToken,
        senderAmount: data.senderAmount,
        r: data.r,
        s: data.s,
        v: data.v
    }
}
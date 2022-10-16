import { Order } from '@airswap/typescript';

export function mapAnyToOrder(data: any): Order {
    return {
        nonce: String(data.nonce),
        signerWallet: String(data.signerWallet),
        signerToken: String(data.signerToken),
        signerAmount: String(data.signerAmount),
        senderToken: String(data.senderToken),
        senderAmount: String(data.senderAmount),
        expiry: String(data.expiry)!,
        r: String(data.r),
        s: String(data.s),
        v: String(data.v),
    }
}
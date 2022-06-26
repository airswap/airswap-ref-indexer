import { DbOrder } from 'model/DbOrder.js';
import { toNumber } from '../converter/index.js';

/**
 * Caller should ensure, number fields are present
 * @param data object that conatins all the needed fields
 * @returns a DbOrder
 */
export function mapAnyToDbOrder(data: any): DbOrder {
    return {
        nonce: data.nonce,
        expiry: toNumber(data.expiry)!,
        signerWallet: data.signerWallet,
        signerToken: data.signerToken,
        signerAmount: data.signerAmount,
        approximatedSignerAmount: toNumber(data.signerAmount)!,
        senderToken: data.senderToken,
        senderAmount: data.senderAmount,
        approximatedSenderAmount: toNumber(data.senderAmount)!,
        r: data.r,
        s: data.s,
        v: data.v
    }
}
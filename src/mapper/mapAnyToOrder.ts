import { DbOrder } from 'model/DbOrder.js';
import { toNumber } from '../converter/index.js';

/**
 * Caller should ensure, number fields are present
 * @param data object that conatins all the needed fields
 * @returns a DbOrder
 */
export function mapAnyToDbOrder(data: any): DbOrder {
    return {
        nonce: String(data.nonce),
        expiry: toNumber(data.expiry)!,
        signerWallet: String(data.signerWallet),
        signerToken: String(data.signerToken),
        signerAmount: String(data.signerAmount),
        approximatedSignerAmount: toNumber(data.signerAmount)!,
        senderToken: String(data.senderToken),
        senderAmount: String(data.senderAmount),
        approximatedSenderAmount: toNumber(data.senderAmount)!,
        r: String(data.r),
        s: String(data.s),
        v: String(data.v)
    }
}
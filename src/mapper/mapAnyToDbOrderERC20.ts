import { DbOrderERC20 } from 'model/DbOrderTypes.js';
import { toBigInt, toNumber } from '../converter/index.js';

/**
 * Caller should ensure, number fields are present
 * @param data object that conatins all the needed fields
 * @returns a DbOrderERC20
 */
export function mapAnyToDbOrderERC20(data: any): DbOrderERC20 {
    return {
        nonce: Number(data.nonce),
        signerWallet: String(data.signerWallet),
        signerToken: String(data.signerToken),
        signerAmount: String(data.signerAmount),
        protocolFee: String(data.protocolFee),
        senderWallet: String(data.senderWallet),
        senderToken: String(data.senderToken),
        senderAmount: String(data.senderAmount),
        expiry: toNumber(data.expiry)!,
        approximatedSignerAmount: toBigInt(data.signerAmount)!,
        approximatedSenderAmount: toBigInt(data.senderAmount)!,
        r: String(data.r),
        s: String(data.s),
        v: String(data.v),
        chainId: Number(data.chainId),
        swapContract: String(data.swapContract)
    }
}
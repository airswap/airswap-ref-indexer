import { DbOrderERC20 } from 'model/DbOrderTypes.js';
import { toBigInt, toNumber } from '../converter/index.js';

/**
 * Caller should ensure, number fields are present
 * @param data object that conatins all the needed fields
 * @returns a DbOrderERC20
 */
export function mapAnyToDbOrderERC20(data: any): DbOrderERC20 {
    return {
        nonce: String(data.nonce),
        signerWallet: String(data.signerWallet).toLocaleLowerCase(),
        signerToken: String(data.signerToken).toLocaleLowerCase(),
        signerAmount: String(data.signerAmount),
        protocolFee: String(data.protocolFee),
        senderWallet: String(data.senderWallet).toLocaleLowerCase(),
        senderToken: String(data.senderToken).toLocaleLowerCase(),
        senderAmount: String(data.senderAmount),
        expiry: toNumber(data.expiry)!,
        approximatedSignerAmount: toBigInt(data.signerAmount)!,
        approximatedSenderAmount: toBigInt(data.senderAmount)!,
        r: String(data.r),
        s: String(data.s),
        v: String(data.v),
        chainId: Number(data.chainId),
        swapContract: String(data.swapContract).toLocaleLowerCase()
    }
}
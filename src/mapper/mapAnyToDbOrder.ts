import { toBigInt } from '../converter/index.js';
import { DbOrderMarketPlace, DbOrderParty } from 'model/DbOrderTypes.js';

export function mapAnyToDbOrderMarketPlace(data: any): DbOrderMarketPlace {
    return {
        nonce: String(data.nonce),
        expiry: Number(data.expiry),
        protocolFee: String(data.protocolFee),
        signer: mapToOrderParty(data.signer),
        sender: mapToOrderParty(data.sender),
        r: String(data.r),
        s: String(data.s),
        v: String(data.v),
        chainId: Number(data.chainId),
        swapContract: String(data.swapContract),
        affiliateWallet: String(data.affiliateWallet),
        affiliateAmount: String(data.affiliateAmount)
    }
}

function mapToOrderParty(field: any): DbOrderParty {
    return {
        wallet: String(field.wallet),
        token: String(field.token),
        kind: String(field.kind),
        id: String(field.id),
        amount: String(field.amount),
        approximatedAmount: toBigInt(field.amount)!
    }
}
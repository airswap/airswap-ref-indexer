import { toBigInt } from "../converter/index.js";
import { DbOrder, DbOrderParty } from "model/DbOrderTypes.js";

export function mapAnyToDbOrder(data: any): DbOrder {
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
        swapContract: String(data.swapContract).toLocaleLowerCase(),
        affiliateWallet: String(data.affiliateWallet).toLocaleLowerCase(),
        affiliateAmount: String(data.affiliateAmount)
    };
}

function mapToOrderParty(field: any): DbOrderParty {
    return {
        wallet: String(field.wallet).toLocaleLowerCase(),
        token: String(field.token).toLocaleLowerCase(),
        kind: String(field.kind).toLocaleLowerCase(),
        id: String(field.id).toLocaleLowerCase(),
        amount: String(field.amount),
        approximatedAmount: toBigInt(field.amount)!
    };
}

import { DbOrderFilter } from "model/DbOrderTypes.js";
import { toNumber, toArray, toBigInt } from "../converter/index.js";
import { isNumeric } from '../validator/index.js';
import { toSortField, toSortOrder } from '@airswap/libraries';

export function mapAnyToOrderFilter(data: any): DbOrderFilter {
    return {
        signerWallet: data.signerWallet,
        signerMinAmount: toBigInt(data.signerMinAmount),
        signerMaxAmount: toBigInt(data.signerMaxAmount),
        signerTokens: toArray(data.signerTokens),
        senderWallet: data.senderWallet,
        senderMinAmount: toBigInt(data.senderMinAmount),
        senderMaxAmount: toBigInt(data.senderMaxAmount),
        senderTokens: toArray(data.senderTokens),
        sortField: toSortField(data.sortField),
        sortOrder: toSortOrder(data.sortOrder),
        offset: isNumeric(data.offset) ? toNumber(data.offset)! : 0,
        limit: isNumeric(data.limit) ? toNumber(data.limit)! : 20,
    }
}
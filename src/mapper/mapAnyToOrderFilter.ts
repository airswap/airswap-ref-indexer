import { DbOrderFilter } from "model/DbOrderTypes.js";
import { toNumber, toArray, toBigInt } from "../converter/index.js";
import { isNumeric } from '../validator/index.js';
import { toSortField, toSortOrder } from '@airswap/libraries';

export function mapAnyToOrderFilter(data: any, maxResultByQuery: number): DbOrderFilter {
    let limit = maxResultByQuery;
    if (isNumeric(data.limit)) {
        const requestedLimit = toNumber(data.limit)!
        if (requestedLimit < limit) {
            limit = requestedLimit;
        }
    }

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
        limit
    }
}
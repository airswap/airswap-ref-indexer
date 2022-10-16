import { toNumber, toArray, toBigInt } from "../converter/index.js";
import { RequestFilter } from "../database/filter/RequestFilter.js";
import { toSortField } from "../database/filter/SortField.js";
import { toSortOrder } from "../database/filter/SortOrder.js";
import { isNumeric } from '../validator/index.js';

export function mapAnyToRequestFilter(data: any): RequestFilter {
    return {
        signerTokens: toArray(data.signerTokens),
        senderTokens: toArray(data.senderTokens),
        minSignerAmount: toBigInt(data.minSignerAmount),
        maxSignerAmount: toBigInt(data.maxSignerAmount),
        minSenderAmount: toBigInt(data.minSenderAmount),
        maxSenderAmount: toBigInt(data.maxSenderAmount),
        page: isNumeric(data.page) ? +data.page : 1,
        sortField: toSortField(data.sortField),
        sortOrder: toSortOrder(data.sortOrder),
        maxAddedDate: toNumber(data.maxAddedDate)
    }
}
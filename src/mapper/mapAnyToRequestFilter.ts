import { toNumber, toStrings } from "../converter/index.js";
import { toSortField } from "../database/filter/SortField.js";
import { toSortOrder } from "../database/filter/SortOrder.js";
import { isNumeric } from '../validator/index.js';
import { RequestFilter } from "../database/filter/RequestFilter.js";

export function mapAnyToRequestFilter(data: any): RequestFilter {
    if (!data || typeof data != 'object') {
        return undefined;
    }

    return {
        signerTokens: toStrings(data.signerTokens),
        senderTokens: toStrings(data.senderTokens),
        minSignerAmount: toNumber(data.minSignerAmount),
        maxSignerAmount: toNumber(data.maxSignerAmount),
        minSenderAmount: toNumber(data.minSenderAmount),
        maxSenderAmount: toNumber(data.maxSenderAmount),
        page: isNumeric(data.page) ? +data.page : 1,
        sortField: toSortField(data.sortField),
        sortOrder: toSortOrder(data.sortOrder),
        maxAddedDate: toNumber(data.maxAddedDate)
    }
}
import { RequestFilterMarketPlace } from "@airswap/types";
import { toSortField, toSortOrder } from '@airswap/libraries';

export function mapAnyToRequestFilterMarletPlace(data: any): RequestFilterMarketPlace {
    return {
        sortField: toSortField(data.sortField),
        sortOrder: toSortOrder(data.sortOrder),
        signerAddress: data.signerAddress,
        senderAddress: data.senderAddress,
        page: Number(data.page),
    }
}
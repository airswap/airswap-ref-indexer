import { AmountLimitFilterResponse, FiltersResponse } from "@airswap/types";
import { Filters } from "../database/filter/Filters.js";

export function mapToFilterResponse(filters: Filters): FiltersResponse {
    const senderToken: Record<string, AmountLimitFilterResponse> = {};
    const signerToken: Record<string, AmountLimitFilterResponse> = {};
    Object.keys(filters.senderToken).forEach(key => {
        senderToken[key] = {
            min: filters.senderToken[key].min.toString(),
            max: filters.senderToken[key].max.toString()
        } as AmountLimitFilterResponse;
    });
    Object.keys(filters.signerToken).forEach(key => {
        signerToken[key] = {
            min: filters.signerToken[key].min.toString(),
            max: filters.signerToken[key].max.toString()
        } as AmountLimitFilterResponse;
    });

    return { senderToken, signerToken };
}
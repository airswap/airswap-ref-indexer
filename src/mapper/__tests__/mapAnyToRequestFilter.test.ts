import { SortOrder } from './../../database/filter/SortOrder';
import { SortField } from './../../database/filter/SortField';
import { mapAnyToRequestFilter } from '../mapAnyToRequestFilter';

describe("mapAnyToRequestFilter", () => {
    test("should return undefined", () => {
        expect(mapAnyToRequestFilter("")).toBeUndefined();
        expect(mapAnyToRequestFilter(undefined)).toBeUndefined();
        expect(mapAnyToRequestFilter(null)).toBeUndefined();
        expect(mapAnyToRequestFilter(1)).toBeUndefined();
    });

    test("should map all string values", () => {
        expect(mapAnyToRequestFilter({
            maxSenderAmount: "20",
            maxSignerAmount: "200",
            minSenderAmount: "2",
            minSignerAmount: "200",
            page: "3",
            senderTokens: "dai,btc",
            signerTokens: "eth,ast",
            sortField: "SENDER_AMOUNT",
            sortOrder: "DESC",
            maxAddedDate: "321546"
        })).toEqual({
            maxSenderAmount: 20,
            maxSignerAmount: 200,
            minSenderAmount: 2,
            minSignerAmount: 200,
            page: 3,
            senderTokens: ["dai", "btc"],
            signerTokens: ["eth", "ast"],
            sortField: SortField.SENDER_AMOUNT,
            sortOrder: SortOrder.DESC,
            maxAddedDate: 321546
        });
    });

    test("should default page to 1", () => {
        expect(mapAnyToRequestFilter({
            maxSenderAmount: "20",
            maxSignerAmount: "200",
            minSenderAmount: "2",
            minSignerAmount: "200",
            senderTokens: "dai",
            signerTokens: "eth",
            sortField: "SENDER_AMOUNT",
            sortOrder: "DESC",
            maxAddedDate: "321546"
        })).toEqual({
            maxSenderAmount: 20,
            maxSignerAmount: 200,
            minSenderAmount: 2,
            minSignerAmount: 200,
            page: 1,
            senderTokens: ["dai"],
            signerTokens: ["eth"],
            sortField: SortField.SENDER_AMOUNT,
            sortOrder: SortOrder.DESC,
            maxAddedDate: 321546
        });
    });
});
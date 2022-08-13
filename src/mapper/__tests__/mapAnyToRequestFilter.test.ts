import { mapAnyToRequestFilter } from '../mapAnyToRequestFilter';
import { SortField } from './../../database/filter/SortField';
import { SortOrder } from './../../database/filter/SortOrder';

describe("mapAnyToRequestFilter", () => {
    test("should map all string values", () => {
        expect(mapAnyToRequestFilter({
            maxSenderAmount: "20",
            maxSignerAmount: "200",
            minSenderAmount: "2",
            minSignerAmount: "200",
            page: "3",
            senderTokens: ["dai","btc"],
            signerTokens: ["eth","ast"],
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
            senderTokens: ["dai"],
            signerTokens: ["eth"],
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
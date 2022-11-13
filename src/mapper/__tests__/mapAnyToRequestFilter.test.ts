import { mapAnyToRequestFilter } from '../mapAnyToRequestFilter';
import { SortField } from '@airswap/libraries/build/src/Indexer';
import { SortOrder } from '@airswap/libraries/build/src/Indexer';

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
            maxSenderAmount: BigInt(20),
            maxSignerAmount: BigInt(200),
            minSenderAmount: BigInt(2),
            minSignerAmount: BigInt(200),
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
            maxSenderAmount: BigInt(20),
            maxSignerAmount: BigInt(200),
            minSenderAmount: BigInt(2),
            minSignerAmount: BigInt(200),
            page: 1,
            senderTokens: ["dai"],
            signerTokens: ["eth"],
            sortField: SortField.SENDER_AMOUNT,
            sortOrder: SortOrder.DESC,
            maxAddedDate: 321546
        });
    });
});
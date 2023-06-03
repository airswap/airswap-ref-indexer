import { mapAnyToOrderFilter } from '../mapAnyToOrderFilter';
import { SortField, SortOrder } from '@airswap/types';

describe("mapAnyToRequestFilter", () => {
    test("should map all string values", () => {
        expect(mapAnyToOrderFilter({
            senderMaxAmount: "20",
            signerMaxAmount: "200",
            senderMinAmount: "2",
            signerMinAmount: "200",
            limit: 10,
            offset: 30,
            senderTokens: ["dai", "btc"],
            signerTokens: ["eth", "ast"],
            sortField: "SENDER_AMOUNT",
            sortOrder: "DESC",
        }, 10)).toEqual({
            senderMaxAmount: BigInt(20),
            signerMaxAmount: BigInt(200),
            senderMinAmount: BigInt(2),
            signerMinAmount: BigInt(200),
            limit: 10,
            offset: 30,
            senderTokens: ["dai", "btc"],
            signerTokens: ["eth", "ast"],
            sortField: SortField.SENDER_AMOUNT,
            sortOrder: SortOrder.DESC,
        });
    });

    test("Restrain limit to configured", () => {
        expect(mapAnyToOrderFilter({
            senderMaxAmount: "20",
            signerMaxAmount: "200",
            senderMinAmount: "2",
            signerMinAmount: "200",
            limit: 10,
            offset: -1,
            senderTokens: ["dai"],
            signerTokens: ["eth"],
            sortField: "SENDER_AMOUNT",
            sortOrder: "DESC",
        }, 2)).toEqual({
            senderMaxAmount: BigInt(20),
            signerMaxAmount: BigInt(200),
            senderMinAmount: BigInt(2),
            signerMinAmount: BigInt(200),
            limit: 2,
            offset: 0,
            senderTokens: ["dai"],
            signerTokens: ["eth"],
            sortField: SortField.SENDER_AMOUNT,
            sortOrder: SortOrder.DESC,
        });
    });
});
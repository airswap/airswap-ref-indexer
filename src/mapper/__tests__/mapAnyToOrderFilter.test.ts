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
        })).toEqual({
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

    // test("should set offset to 0 and limit 100", () => {
    //     expect(mapAnyToOrderFilter({
    //         senderMaxAmount: "20",
    //         signerMaxAmount: "200",
    //         senderMinAmount: "2",
    //         signerMinAmount: "200",
    //         limit: 10,
    //         offset: 30,
    //         senderTokens: ["dai"],
    //         signerTokens: ["eth"],
    //         sortField: "SENDER_AMOUNT",
    //         sortOrder: "DESC",
    //     })).toEqual({
    //         senderMaxAmount: BigInt(20),
    //         signerMaxAmount: BigInt(200),
    //         senderMinAmount: BigInt(2),
    //         signerMinAmount: BigInt(200),
    //         limit: 10,
    //         offset: 30,
    //         senderTokens: ["dai"],
    //         signerTokens: ["eth"],
    //         sortField: SortField.SENDER_AMOUNT,
    //         sortOrder: SortOrder.DESC,
    //     });
    // });
});
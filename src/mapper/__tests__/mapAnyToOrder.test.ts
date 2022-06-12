import { mapAnyToOrder } from "../mapAnyToOrder";

describe("mapAnyToOrder", () => {
    test("should return undefined", () => {
        expect(mapAnyToOrder("")).toBeUndefined();
        expect(mapAnyToOrder(undefined)).toBeUndefined();
        expect(mapAnyToOrder(null)).toBeUndefined();
        expect(mapAnyToOrder(1)).toBeUndefined();
    });

    test("should map all string values", () => {
        expect(mapAnyToOrder({
            expiry: "1653900784706",
            nonce: "nonce",
            r: "r",
            s: "s",
            senderAmount: "10",
            senderToken: "ETH",
            signerAmount: "5",
            signerToken: "dai",
            signerWallet: "signerWallet",
            v: "v",
        })).toEqual({
            expiry: 1653900784706,
            nonce: "nonce",
            r: "r",
            s: "s",
            senderAmount: 10,
            senderToken: "ETH",
            signerAmount: 5,
            signerToken: "dai",
            signerWallet: "signerWallet",
            v: "v",
        });
    });
});
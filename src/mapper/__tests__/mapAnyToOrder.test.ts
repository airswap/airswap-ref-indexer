import { mapAnyToDbOrder } from "../mapAnyToOrder";

describe("mapAnyToOrder", () => {
    test("should map all string values", () => {
        expect(mapAnyToDbOrder({
            expiry: "1653900784706",
            nonce: "nonce",
            r: "r",
            s: "s",
            senderAmount: "10",
            senderToken: "ETH",
            signerAmount: "5",
            signerToken: "dai",
            signerWallet: "signerWallet",
            protocolFee: "4",
            senderWallet: "senderWallet",
            v: "v",
            chainId: "5",
            swapContract: "0x0000000000000000000000000000000000000000"
        })).toEqual({
            expiry: 1653900784706,
            nonce: "nonce",
            senderAmount: "10",
            senderToken: "ETH",
            signerAmount: "5",
            signerToken: "dai",
            signerWallet: "signerWallet",
            protocolFee: "4",
            senderWallet: "senderWallet",
            approximatedSenderAmount: 10,
            approximatedSignerAmount: 5,
            r: "r",
            s: "s",
            v: "v",
            chainId: "5",
            swapContract: "0x0000000000000000000000000000000000000000"
        });
    });
});
import { mapAnyToDbOrder } from "../mapAnyToDbOrder";
import { AddressZero } from '@ethersproject/constants';

describe("mapAnyToDbOrder", () => {
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
            swapContract: AddressZero
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
            approximatedSenderAmount: BigInt(10),
            approximatedSignerAmount: BigInt(5),
            r: "r",
            s: "s",
            v: "v",
            chainId: "5",
            swapContract: AddressZero
        });
    });
});
import { mapAnyToDbOrderERC20 } from "../mapAnyToDbOrderERC20";
import { AddressZero } from '@ethersproject/constants';

describe("mapAnyToDbOrder", () => {
    test("should map all string values", () => {
        expect(mapAnyToDbOrderERC20({
            expiry: "1653900784706",
            nonce: "123",
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
            nonce: 123,
            senderAmount: "10",
            senderToken: "eth",
            signerAmount: "5",
            signerToken: "dai",
            signerWallet: "signerwallet",
            protocolFee: "4",
            senderWallet: "senderwallet",
            approximatedSenderAmount: BigInt(10),
            approximatedSignerAmount: BigInt(5),
            r: "r",
            s: "s",
            v: "v",
            chainId: 5,
            swapContract: AddressZero
        });
    });
});
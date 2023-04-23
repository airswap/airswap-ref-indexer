import { FullOrderERC20 } from '@airswap/types';

export function mapAnyToFullOrder(data: any): FullOrderERC20 {
    return {
        nonce: String(data.nonce),
        signerWallet: String(data.signerWallet),
        signerToken: String(data.signerToken),
        signerAmount: String(data.signerAmount),
        senderToken: String(data.senderToken),
        senderAmount: String(data.senderAmount),
        expiry: String(data.expiry)!,
        r: String(data.r),
        s: String(data.s),
        v: String(data.v),
        protocolFee:  String(data.protocolFee), 
        senderWallet:  String(data.senderWallet),
        chainId:  Number(data.chainId), 
        swapContract:  String(data.swapContract)
    }
}
export declare type DbOrder = {
    nonce: string
    signerWallet: string
    signerToken: string
    signerAmount: string
    protocolFee: string
    senderWallet: string
    senderToken: string
    senderAmount: string
    expiry: number;
    approximatedSignerAmount: BigInt;
    approximatedSenderAmount: BigInt;
} & Signature & Settlement;

export declare type Signature = {
    v: string;
    r: string;
    s: string;
};

export type Settlement = {
    chainId: string
    swapContract: string
}
export declare type DbOrder = {
    nonce: string;
    expiry: number;
    signerWallet: string;
    signerToken: string;
    senderToken: string;
    signerAmount: string;
    senderAmount: string;
    approximatedSignerAmount: number;
    approximatedSenderAmount: number;
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
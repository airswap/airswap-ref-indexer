export declare type DbOrder = {
    nonce: string;
    expiry: number;
    signerWallet: string;
    signerToken: string;
    signerAmount: number;
    senderToken: string;
    senderAmount: number;
} & Signature;

export declare type Signature = {
    v: string;
    r: string;
    s: string;
};
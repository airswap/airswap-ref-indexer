export class Order {
    id: string;
    signerWallet: string;
    signerToken: string;
    senderToken: string;
    senderAmount: number;
    signerAmount: number;
    expiry: Date;

    constructor(signerWallet: string, signerToken: string, senderToken: string, senderAmount: number, signerAmount: number, expiry: Date, id?: string) {
        this.id = id;
        this.signerWallet = signerWallet;
        this.signerToken = signerToken;
        this.senderToken = senderToken;
        this.senderAmount = senderAmount;
        this.signerAmount = signerAmount;
        this.expiry = expiry;
    }
}
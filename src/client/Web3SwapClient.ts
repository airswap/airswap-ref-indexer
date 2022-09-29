import { Contract, ContractInterface, ethers } from 'ethers';
import { Database } from './../database/Database';

export class Web3SwapClient {
    private contract: Contract;
    private database: Database;

    constructor(apiKey: string, registryAddress: string, abi: ContractInterface, network: string, database: Database) {
        const provider = ethers.providers.InfuraProvider.getWebSocketProvider(network, apiKey);
        this.database = database;
        this.contract = new ethers.Contract(registryAddress, abi, provider);

        this.contract.on("Swap", (nonce, timestamp, signerWallet, signerToken, signerAmount, protocolFee, senderWallet, senderToken, senderAmount) => {
            this.onEvent(nonce, signerWallet);
        });
        
        this.contract.on("Cancel", (nonce, signerWallet) => {
            this.onEvent(nonce, signerWallet);
        });
    }

    private onEvent(nonce: { _hex: string, _isBigNumber: boolean }, signerWallet: string) {        
        if (nonce && signerWallet) {
            const decodedNonce = parseInt(nonce._hex, 16);
            if (isNaN(decodedNonce)) return;
            
            this.database.deleteOrder(`${decodedNonce}`, signerWallet);
        }
    }
}
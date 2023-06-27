import { Contract, ethers, providers } from 'ethers';
import { Database } from '../database/Database.js';
import { Swap } from '@airswap/libraries'

export class Web3SwapClient {
    private contracts: Contract[] = [];
    private database: Database;
    private apiKey: string;
    private registeredChains: string[] = [];

    constructor(apiKey: string, database: Database) {
        this.database = database;
        this.apiKey = apiKey;
    }

    public connectToChain(network: number | string): boolean {
        let chainId: number
        let contract: Contract
        let provider: providers.Provider

        try {
            chainId = ethers.providers.getNetwork(network)?.chainId;
            if (!chainId) {
                console.warn("Tried to add this network but it does not work :", network)
                return false
            }
            if (this.keyExists(String(chainId))) {
                console.log("Already connected");
                return true
            }
    
            provider = ethers.providers.InfuraProvider.getWebSocketProvider(chainId, this.apiKey);
            contract = Swap.getContract(provider, chainId);
        } catch (err) {
            return false
        }
        
        contract.on("Swap", (nonce, signerWallet) => {
            this.onEvent(nonce, signerWallet);
        });
        contract.on("Cancel", (nonce, signerWallet) => {
            this.onEvent(nonce, signerWallet);
        });
        this.contracts.push(contract);
        this.registeredChains.push(String(chainId));
        console.log("Registered event SWAP from chain", chainId)
        return true
    }

    private keyExists(network: string): boolean {
        return this.registeredChains.includes(network);
    }

    private onEvent(nonce: { _hex: string, _isBigNumber: boolean }, signerWallet: string) {
        if (nonce && signerWallet) {
            const decodedNonce = parseInt(nonce._hex, 16);
            if (isNaN(decodedNonce)) return;
            
            this.database.deleteOrder(decodedNonce, signerWallet.toLocaleLowerCase());
        }
    }
}
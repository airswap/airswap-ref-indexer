import { Contract, ethers } from 'ethers';
import { Database } from '../database/Database.js';
import { SwapERC20 } from '@airswap/libraries'


export class Web3SwapERC20Client {
    private contracts: Contract[] = [];
    private database: Database;
    private apiKey: string;
    private registeredChains: string[] = [];

    constructor(apiKey: string, database: Database) {
        this.database = database;
        this.apiKey = apiKey;
    }

    public connectToChain(network: number|string) {
        const chainId = ethers.providers.getNetwork(network)?.chainId;
        if (!chainId) {
            console.warn("Tried to add this network but it does not work :", network)
            return;
        }
        if (this.keyExists(String(chainId))) {
            console.log("Already connected");
            return;
        }

        const provider = ethers.providers.InfuraProvider.getWebSocketProvider(chainId, this.apiKey);
        const contract = SwapERC20.getContract(provider, chainId);
        contract.on("SwapERC20", (nonce, timestamp, signerWallet, signerToken, signerAmount, protocolFee, senderWallet, senderToken, senderAmount) => {
            this.onEvent(nonce, signerWallet);
        });
        contract.on("Cancel", (nonce, signerWallet) => {
            this.onEvent(nonce, signerWallet);
        });
        this.contracts.push(contract);
        this.registeredChains.push(String(chainId));
        console.log("Registered event from chain", chainId)
    }

    private keyExists(network: string): boolean {
        return this.registeredChains.includes(network);
    }

    private onEvent(nonce: { _hex: string, _isBigNumber: boolean }, signerWallet: string) {
        if (nonce && signerWallet) {
            const decodedNonce = parseInt(nonce._hex, 16);
            if (isNaN(decodedNonce)) return;

            this.database.deleteOrderERC20(`${decodedNonce}`, signerWallet);
        }
    }
}
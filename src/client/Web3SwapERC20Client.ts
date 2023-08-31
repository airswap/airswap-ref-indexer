import { Contract, ethers, providers } from 'ethers';
import { Database } from '../database/Database.js';
import { SwapERC20 } from '@airswap/libraries'
import { getProviderUrl } from './getProviderUrl.js';

export class Web3SwapERC20Client {
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
            chainId = Number(network);
            if (!chainId || isNaN(chainId)) {
                console.warn("Tried to add this network but it does not work :", network)
                return false
            }
            if (this.keyExists(String(chainId))) {
                console.log("Already connected");
                return true
            }
            const url = getProviderUrl(chainId, this.apiKey)
            console.log("Web3SwapERC20Client rpc url :", url)
            provider = new ethers.providers.JsonRpcProvider(url)
            contract = SwapERC20.getContract(provider, chainId);
        } catch (err) {
            return false
        }

        contract.on("SwapERC20", (nonce, signerWallet) => {
            console.log("Web3SwapERC20Client SwapERC20 event", nonce, signerWallet)
            this.onEvent(nonce, signerWallet);
        });
        contract.on("Cancel", (nonce, signerWallet) => {
            console.log("Web3SwapERC20Client Cancel event", nonce, signerWallet)
            this.onEvent(nonce, signerWallet);
        });
        this.contracts.push(contract);
        this.registeredChains.push(String(chainId));
        console.log("Registered event SWAP ERC20 from chain", chainId, "address:",contract.address)
        return true
    }

    private keyExists(network: string): boolean {
        return this.registeredChains.includes(network);
    }

    private onEvent(nonce: { _hex: string, _isBigNumber: boolean }, signerWallet: string) {
        if (nonce && signerWallet) {
            const decodedNonce = parseInt(nonce._hex, 16);
            if (isNaN(decodedNonce)) {
                console.log("Web3SwapERC20Client decoded nonce is NaN");
                return;
            }
                
            console.log("Web3SwapERC20Client will delete", decodedNonce, signerWallet.toLocaleLowerCase());
            this.database.deleteOrderERC20(decodedNonce, signerWallet.toLocaleLowerCase());
        }
    }
}
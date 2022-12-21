import { DbOrder } from 'model/DbOrder.js';
import { Contract, ContractInterface, ethers } from 'ethers';
import { Database } from '../database/Database.js';
import { getNetwork } from './getNetwork.js';

export class Web3SwapClient {
    private contracts: Record<string, Contract> = {};
    private database: Database;
    private abi: ContractInterface;
    private apiKey: string;

    constructor(apiKey: string, abi: ContractInterface, database: Database) {
        this.database = database;
        this.abi = abi;
        this.apiKey = apiKey;
    }

    public addContractIfNotExists(registryAddress: string, network: string) {
        const mappedNetwork = getNetwork(network);
        if (!mappedNetwork) {
            console.warn("Tried to add this pair but it does not work :", registryAddress, network)
            return;
        }
        if (this.keyExists(registryAddress, mappedNetwork)) {
            console.log("Already connected");
            return;
        }

        const provider = ethers.providers.InfuraProvider.getWebSocketProvider(mappedNetwork, this.apiKey);
        const contract = new ethers.Contract(registryAddress, this.abi, provider);
        contract.on("Swap", (nonce, timestamp, signerWallet, signerToken, signerAmount, protocolFee, senderWallet, senderToken, senderAmount) => {
            this.onEvent(nonce, signerWallet);
        });
        contract.on("Cancel", (nonce, signerWallet) => {
            this.onEvent(nonce, signerWallet);
        });
        this.contracts[this.generateKey(registryAddress, mappedNetwork)] = contract;
        console.log("Registered event from", registryAddress, `${mappedNetwork}(${network})`)
    }

    public async isValidOrder(dbOrder: DbOrder) {
        let isValid = false;
        const contract = this.contracts[this.generateKey(dbOrder.swapContract, getNetwork(dbOrder.chainId))];
        if (!contract) {
            return Promise.resolve(isValid);
        }
        try {            
            isValid = await contract.check(
                dbOrder.senderWallet,
                dbOrder.nonce,
                dbOrder.expiry,
                dbOrder.signerWallet,
                dbOrder.signerToken,
                dbOrder.signerAmount,
                dbOrder.senderToken,
                dbOrder.senderAmount,
                dbOrder.v,
                dbOrder.r,
                dbOrder.s
            )
        } catch (err) {
            console.error(err);
        }
        return Promise.resolve(isValid);
    }

    private generateKey(registryAddress: string, network: string): string {
        return `${registryAddress}:${network}`
    }

    private keyExists(registryAddress: string, network: string): boolean {
        const keyToFind = this.generateKey(registryAddress, network);
        return Object.keys(this.contracts).indexOf(keyToFind) !== -1;
    }

    private onEvent(nonce: { _hex: string, _isBigNumber: boolean }, signerWallet: string) {
        if (nonce && signerWallet) {
            const decodedNonce = parseInt(nonce._hex, 16);
            if (isNaN(decodedNonce)) return;

            this.database.deleteOrder(`${decodedNonce}`, signerWallet);
        }
    }
}
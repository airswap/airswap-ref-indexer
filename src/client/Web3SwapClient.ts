import { Contract, ContractInterface, ethers } from 'ethers';
import { Database } from '../database/Database.js';
import { getNetwork } from './getNetwork.js';

export class Web3SwapClient {
    private contracts: Contract[] = [];
    private database: Database;
    private abi: ContractInterface;
    private apiKey: string;
    private registeredContracts: string[] = [];

    constructor(apiKey: string, abi: ContractInterface, database: Database) {
        this.database = database;
        this.abi = abi;
        this.apiKey = apiKey;
    }

    public addContractIfNotExists(registryAddress: string, network: number|string) {
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
        this.contracts.push(contract);
        this.registeredContracts.push(this.generateKey(registryAddress, mappedNetwork));
        console.log("Registered event from", registryAddress, `${mappedNetwork}(${network})`)
    }

    private generateKey(registryAddress: string, network: string): string {
        return `${registryAddress}:${network}`
    }

    private keyExists(registryAddress: string, network: string): boolean {
        const keyToFind = this.generateKey(registryAddress, network);
        return this.registeredContracts.indexOf(keyToFind) !== -1;
    }

    private onEvent(nonce: { _hex: string, _isBigNumber: boolean }, signerWallet: string) {
        if (nonce && signerWallet) {
            const decodedNonce = parseInt(nonce._hex, 16);
            if (isNaN(decodedNonce)) return;

            this.database.deleteOrderERC20(`${decodedNonce}`, signerWallet);
        }
    }
}
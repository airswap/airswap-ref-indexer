import { Contract, ContractInterface, ethers, utils } from 'ethers';
import { Database } from './../database/Database';

export class Web3RegistryClient {
    private contract: Contract;
    private database: Database;

    constructor(apiKey: string, registryAddress: string, abi: ContractInterface, network: string, database: Database) {
        const provider = ethers.providers.InfuraProvider.getWebSocketProvider(network, apiKey);
        this.database = database;
        this.contract = new ethers.Contract(registryAddress, abi, provider);

        this.contract.on("Swap", (from, to, value) => {
            console.log("Swap", value);
            if (value?.args?.nonce && value?.args?.signerWallet) {
                this.database.deleteOrder(value.args.nonce, value.args.signerWallet);
            }
        });
        
        this.contract.on("Cancel", (from, to, value) => {
            console.log("Cancel", value);
            if (value?.args?.nonce && value?.args?.signerWallet) {
                this.database.deleteOrder(value.args.nonce, value.args.signerWallet);
            }
        });
    }
}
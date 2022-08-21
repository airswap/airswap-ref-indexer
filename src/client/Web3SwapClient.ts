import { Contract, ContractInterface, ethers } from 'ethers';
import { Database } from './../database/Database';

export class Web3SwapClient {
    private contract: Contract;
    private database: Database;

    constructor(apiKey: string, registryAddress: string, abi: ContractInterface, network: string, database: Database) {
        const provider = ethers.providers.InfuraProvider.getWebSocketProvider(network, apiKey);
        this.database = database;
        this.contract = new ethers.Contract(registryAddress, abi, provider);

        this.contract.on("Swap", (from, to, value) => {
            console.log("Swap", value);
            this.onEvent(value);
        });
        
        this.contract.on("Cancel", (from, to, value) => {
            console.log("Cancel", value);
            this.onEvent(value);
        });
    }

    private onEvent(value: any) {        
        if (value?.args?.nonce && value?.args?.signerWallet) {
            this.database.deleteOrder(value.args.nonce, value.args.signerWallet);
        }
    }
}
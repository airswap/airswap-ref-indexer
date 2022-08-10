import { Contract, ContractInterface, ethers, utils } from 'ethers';
import { Peers } from './../peer/Peers';
import { RegistryClient } from './RegistryClient.js';

export class Web3RegistryClient implements RegistryClient {
    private contract: Contract;
    private peers: Peers;

    constructor(apiKey: string, registryAddress: string, abi: ContractInterface, network: string, peers: Peers) {
        const provider = new ethers.providers.InfuraProvider(network, apiKey);
        this.peers = peers;
        const filter = {
            address: registryAddress,
            topics: [
                utils.id("SetURL(address,url)")
            ]
        };
        provider.on(filter, (sender: string, url: string) => {
            this.peers.addPeer(url);
        });
        this.contract = new ethers.Contract(registryAddress, abi, provider);
    }

    async getPeersFromRegistry(): Promise<string[]> {
        const urls = await this.contract.getURLs();
        return Promise.resolve(urls || []);
    }

    async sendIpToRegistry(ip: string): Promise<void> {
        return Promise.resolve();
    }

    removeIpFromRegistry(ip: string): Promise<void> {
        return Promise.resolve();
    }
}
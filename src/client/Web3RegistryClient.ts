import { Contract, ContractInterface, ethers } from 'ethers';
import { Peers } from './../peer/Peers';
import { RegistryClient } from './RegistryClient.js';

export class Web3RegistryClient implements RegistryClient {
    private contract: Contract;
    private peers: Peers;

    constructor(apiKey: string, registryAddress: string, abi: ContractInterface, network: string, peers: Peers) {
        const provider = ethers.providers.InfuraProvider.getWebSocketProvider(network, apiKey);
        this.peers = peers;
        this.contract = new ethers.Contract(registryAddress, abi, provider);
        this.contract.on("SetURL", this.onSetURLEvent);
    }

    async getPeersFromRegistry(): Promise<string[]> {
        const urls = await this.contract.getURLs();
        return Promise.resolve(urls?.filter((url: string) => url && url.trim() != "") || []);
    }

    async sendIpToRegistry(ip: string): Promise<void> {
        return Promise.resolve();
    }

    removeIpFromRegistry(ip: string): Promise<void> {
        return Promise.resolve();
    }

    onSetURLEvent = async (from: string, to: string, value: Record<any, any>): Promise<void> => {
        if (value?.args?.url != undefined && value?.args?.url != null) {
            if (value.args.url === '') {
                const peersToAdd = await this.getPeersFromRegistry();
                this.peers.clear();
                this.peers.addPeers(peersToAdd);
            } else {
                this.peers.addPeer(value.args.url);
            }
        }
        return Promise.resolve();
    }
}
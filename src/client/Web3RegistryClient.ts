import { Contract, ethers } from 'ethers';
import { Peers } from './../peer/Peers.js';
import { Registry } from '@airswap/libraries';
import { Protocols } from '@airswap/constants';

export class Web3RegistryClient {
    private contract: Contract;
    private peers: Peers;
    private provider: ethers.providers.Provider;
    private chainId: number;

    constructor(apiKey: string, network: number, peers: Peers) {
        this.chainId = ethers.providers.getNetwork(network)?.chainId;
        this.provider = ethers.providers.InfuraProvider.getWebSocketProvider(this.chainId, apiKey);
        this.peers = peers;
        this.contract = Registry.getContract(this.provider, this.chainId);
        this.contract.on("SetServerURL", this.onSetURLEvent);
    }

    async getPeersFromRegistry(): Promise<string[]> {
        const urls = (await Registry.getServerURLs(this.provider, this.chainId, Protocols.Indexing))
        return Promise.resolve(urls?.filter((url: string) => url && url.trim() != "") || []);
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
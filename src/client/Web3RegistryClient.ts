import { Contract, ethers } from 'ethers';
import { Peers } from './../peer/Peers.js';
import { RegistryV4 } from '@airswap/libraries';
import { Protocols } from '@airswap/constants';
import { getProviderUrl } from './getProviderUrl.js';

export class Web3RegistryClient {
    private apiKey: string;
    private contracts: Record<number, Contract>;
    private peers: Peers;

    constructor(apiKey: string, network: number, peers: Peers) {
        this.peers = peers;
        this.apiKey = apiKey;
        this.contracts = {};
    }

    async connect(chainId: number) {
        if (this.contracts[chainId]) return;
        const provider = getProviderUrl(chainId, this.apiKey)
        const contract = RegistryV4.getContract(provider, chainId);
        const nodes = await RegistryV4.getServerURLs(provider, +chainId, Protocols.StorageERC20);
        this.peers.addPeers(nodes);
        contract.on("SetServerURL", this.onSetURLEvent);
        this.contracts[chainId] = contract;
    }

    async getPeersFromRegistry(): Promise<any> {
        let urls: string[] = []
        Object.keys(this.contracts).forEach(
            async (chainId) => {
                const provider = getProviderUrl(+chainId, this.apiKey)
                const nodes = await RegistryV4.getServerURLs(provider, +chainId, Protocols.StorageERC20)
                urls = [...urls, ...nodes,]
            }
        );

        console.log(urls)
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

    getConnectedChains(): string[] {
        return Object.keys(this.contracts)
    }
}
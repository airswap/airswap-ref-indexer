import { Contract, ethers, providers, Event } from 'ethers';
import { Database } from '../database/Database.js';
import { Swap } from '@airswap/libraries'
import { getProviderUrl } from './getProviderUrl.js';

type Nonce = { _hex: string, _isBigNumber: boolean };

export class Web3SwapClient {
    private contracts: Contract[] = [];
    private database: Database;
    private apiKey: string;
    private registeredChains: string[] = [];
    private lastBlock: Record<number, number> = {};

    constructor(apiKey: string, database: Database) {
        this.database = database;
        this.apiKey = apiKey;
    }

    public connectToChain(network: number | string): boolean {
        const chainId = ethers.providers.getNetwork(network)?.chainId;
        if (!chainId) {
            console.warn("Tried to add this network but it does not work :", network)
            return false;
        }
        if (this.keyExists(String(chainId))) {
            console.log("Already connected");
            return true;
        }

        try {
            const provider = getProviderUrl(chainId, this.apiKey)
            const contract = Swap.getContract(provider, chainId);
            setInterval(() => {
                this.gatherEvents(provider, this.lastBlock[chainId], contract, chainId).then(endBlock => {
                    if(endBlock) {
                        this.lastBlock[chainId] = endBlock
                    }
                })
            }, 1000 * 10)
            this.contracts.push(contract);
            this.registeredChains.push(String(chainId));
            console.log("Registered event SWAP from chain", chainId, "address:", contract.address)
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    private async gatherEvents(provider: providers.Provider, startBlock: number | undefined, contract: Contract, chain: number) {
        try {
            const endBlock = await provider.getBlockNumber();
            if (!startBlock) {
                startBlock = await provider.getBlockNumber();
            }
            const cancelEvents: Event[] = await contract.queryFilter(contract.filters.Cancel(), startBlock, endBlock);
            const swapEvents: Event[] = await contract.queryFilter(contract.filters.Swap(), startBlock, endBlock);
            const allEvents = [...cancelEvents, ...swapEvents];

            allEvents
                .filter(event => event.args)
                .map(event => ({ nonce: event.args!.nonce, signerWallet: event.args!.signerWallet }))
                .forEach(({ nonce, signerWallet }: { nonce: Nonce, signerWallet: string }) => {
                    this.onEvent(nonce, signerWallet);
                });
            return endBlock
        } catch (err) {
            return startBlock
        }
    }

    private keyExists(network: string): boolean {
        return this.registeredChains.includes(network);
    }

    private onEvent(nonce: Nonce, signerWallet: string) {
        if (nonce && signerWallet) {
            const decodedNonce = parseInt(nonce._hex, 16);
            if (isNaN(decodedNonce)) return;
            this.database.deleteOrder(decodedNonce, signerWallet.toLocaleLowerCase());
        }
    }
}
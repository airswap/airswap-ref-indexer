import { Contract, providers, Event } from 'ethers';
import { Database } from '../database/Database.js';
import { SwapERC20 } from '@airswap/libraries'
import { getProviderUrl } from './getProviderUrl.js';

type Nonce = { _hex: string, _isBigNumber: boolean };

export class Web3SwapERC20Client {
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
            provider = getProviderUrl(chainId, this.apiKey)
            contract = SwapERC20.getContract(provider, chainId);

            setInterval(() => {
                this.gatherEvents(provider, this.lastBlock[chainId], contract, chainId).then(endBlock => {
                    if (endBlock) {
                        this.lastBlock[chainId] = endBlock
                    }
                })
            }, 1000 * 10)
            this.contracts.push(contract);
            this.registeredChains.push(String(chainId));
            console.log("Registered event SWAP ERC20 from chain", chainId, "address:", contract.address)
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
            startBlock = startBlock! - 5;
            console.log("Looking for orderERC20 events between", startBlock, endBlock)
            const cancelEvents: Event[] = await contract.queryFilter(contract.filters.Cancel(), startBlock, endBlock);
            const swapEvents: Event[] = await contract.queryFilter(contract.filters.SwapERC20(), startBlock, endBlock);
            const allEvents = [...cancelEvents, ...swapEvents];

            allEvents
                .filter(event => event.args)
                .map(event => ({ nonce: event.args!.nonce, signerWallet: event.args!.signerWallet }))
                .forEach(({ nonce, signerWallet }: { nonce: Nonce, signerWallet: string }) => {
                    this.onEvent(nonce, signerWallet);
                });
            return endBlock
        } catch (error) {
            return startBlock
        }

    }

    private keyExists(network: string): boolean {
        return this.registeredChains.includes(network);
    }

    private onEvent(nonce: { _hex: string, _isBigNumber: boolean }, signerWallet: string) {
        console.log("OrderERC20 Event found:", nonce, signerWallet)
        if (nonce && signerWallet) {
            const decodedNonce = parseInt(nonce._hex, 16);
            if (isNaN(decodedNonce)) {
                return;
            }

            this.database.deleteOrderERC20(decodedNonce, signerWallet.toLocaleLowerCase());
        }
    }
}
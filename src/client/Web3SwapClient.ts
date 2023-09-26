import { Contract, providers, Event } from 'ethers';
import { Database } from '../database/Database.js';
import { Swap } from '@airswap/libraries'
import { getProviderUrl } from './getProviderUrl.js';
import { DbOrder } from '../model/DbOrderTypes.js';
import { checkResultToErrors } from '@airswap/utils';

type Nonce = { _hex: string, _isBigNumber: boolean };

export class Web3SwapClient {
    private contracts: Record<string, Contract> = {};
    private database: Database;
    private apiKey: string;
    private lastBlock: Record<number, number> = {};

    constructor(apiKey: string, database: Database) {
        this.database = database;
        this.apiKey = apiKey;
    }

    public async connectToChain(network: number | string): Promise<boolean> {
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
            contract = Swap.getContract(provider, chainId);

            const backedUpBlock = await this.database.getLastCheckedBlock(contract.address, chainId);
            if (backedUpBlock) {
                this.lastBlock[chainId] = backedUpBlock
            }

            setInterval(async () => {
                const endBlock = await this.gatherEvents(provider, this.lastBlock[chainId], contract)
                if (endBlock) {
                    this.lastBlock[chainId] = endBlock
                    this.database.setLastCheckedBlock(contract.address, chainId, endBlock);
                }
                return Promise.resolve(endBlock)
            }, 1000 * 10)
            this.contracts[chainId] = contract;
            console.log("Registered event SWAP from chain", chainId, "address:", contract.address)
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    public async isValidOrder(fullOrder: DbOrder) {
        let isValid = true;
        const contract = this.contracts[fullOrder.chainId];
        if (!contract) {
            return Promise.resolve(false);
        }
        try {
            const response = await contract.check(
                fullOrder.sender.wallet,
                fullOrder
            )
            const errors = checkResultToErrors(response[1], response[0])
            isValid = !errors.some(error => Object.keys(OrderErrors).includes(error));
        } catch (err) {
            isValid = false;
            console.error(err);
        }
        return Promise.resolve(isValid);
    }

    private async gatherEvents(provider: providers.Provider, startBlock: number | undefined, contract: Contract) {
        try {
            if (!startBlock) {
                startBlock = await provider.getBlockNumber();
            }
            startBlock = startBlock! - 5;
            const endBlock = await provider.getBlockNumber();
            console.log("Looking for order events between", startBlock, endBlock)

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

    private keyExists(chainId: string): boolean {
        return Object.keys(this.contracts).includes(chainId);
    }

    private onEvent(nonce: Nonce, signerWallet: string) {
        console.log("Order Event found:", nonce, signerWallet)
        if (nonce && signerWallet) {
            const decodedNonce = parseInt(nonce._hex, 16);
            if (isNaN(decodedNonce)) return;
            this.database.deleteOrder(`${decodedNonce}`, signerWallet.toLocaleLowerCase());
        }
    }
}

enum OrderErrors {
    FeeInvalid,
    AffiliateAmountInvalid,
    SignerBalanceLow,
    SignerAllowanceLow,
    SignerTokenKindUnknown,
    OrderExpired,
    NonceTooLow,
    NonceAlreadyUsed,
    Unauthorized,
    SignatoryUnauthorized,
    SignatureInvalid,
    SenderInvalid,
    SenderTokenInvalid,
    SenderTokenKindUnknown,
}
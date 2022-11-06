import { ContractInterface } from 'ethers';
import { createRequire } from 'module';
const customRequire = createRequire(import.meta.url);
const Indexers = customRequire('@airswap/indexer-registry/build/contracts/IndexerRegistry.sol/IndexerRegistry.json');
const Swap = customRequire('@airswap/swap/build/contracts/Swap.sol/Swap.json');

export function getIndexersAbi(){
    return Indexers.abi as unknown as ContractInterface;
}
export function getSwapAbi(){
    return Swap.abi as unknown as ContractInterface;
}
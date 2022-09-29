import { ContractInterface } from 'ethers';
import { createRequire } from 'module';
const customRequire = createRequire(import.meta.url);
const Indexers = customRequire('@airswap/indexers/build/contracts/Indexers.sol/Indexers.json');
const Swap = customRequire('@airswap/swap/build/contracts/Swap.sol/Swap.json');

export function getIndexersAbi(){
    return Indexers.abi as unknown as ContractInterface;
}
export function getSwapAbi(){
    return Swap.abi as unknown as ContractInterface;
}
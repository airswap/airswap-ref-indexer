import { ContractInterface } from 'ethers';
import { createRequire } from 'module';
const customRequire = createRequire(import.meta.url);
const Indexers = customRequire('@airswap/indexer-registry/build/contracts/IndexerRegistry.sol/IndexerRegistry.json');
const Swap = customRequire('@airswap/swap-erc20/build/contracts/SwapERC20.sol/SwapERC20.json');
const contractAdressByChainId = customRequire("@airswap/swap-erc20/deploys.js");


export function getIndexersAbi() {
    return Indexers.abi as unknown as ContractInterface;
}
export function getSwapAbi() {
    return Swap.abi as unknown as ContractInterface;
}

export function getContractAdressByChainId(chainId: number): string | undefined {
    return contractAdressByChainId[chainId];
}
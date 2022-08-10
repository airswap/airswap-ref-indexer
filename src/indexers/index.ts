import { ContractInterface } from 'ethers';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Indexers = require('@airswap/indexers/build/contracts/Indexers.sol/Indexers.json');

export function getIndexersAbi(){
    return Indexers.abi as unknown as ContractInterface;
}
import { getIndexersAbi } from '../indexers/index.js';
import { Peers } from './../peer/Peers.js';
import { HttpRegistryClient } from './HttpRegistryClient.js';
import { RegistryClient } from './RegistryClient.js';
import { Web3RegistryClient } from './Web3RegistryClient.js';

export function getRegistry(useSmartContract: boolean, conf: any, peers: Peers): RegistryClient | null {
    const address: string = conf.REGISTRY;
    const apiKey: string = conf.API_KEY;
    const network: string = conf.NETWORK;

    if (!address) {
        console.error("No registry address defined");
        return null;
    }

    if (useSmartContract) {
        if (!apiKey || !network) {
            console.error("Invalid registry configuration, apiKey, or network are incorrect, check env file !")
            return null;
        }
        return new Web3RegistryClient(apiKey, address, getIndexersAbi(), network, peers);
    } else {
        return new HttpRegistryClient(address);
    }
}


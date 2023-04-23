import { Peers } from './../peer/Peers.js';
import { Web3RegistryClient } from './Web3RegistryClient.js';

export function getRegistry(conf: any, peers: Peers): Web3RegistryClient | null {
    const apiKey: string = conf.API_KEY;
    const network: string = conf.NETWORK;

    if (!apiKey || !network) {
        console.error("Invalid registry configuration, apiKey, or network are incorrect, check env file !")
        return null;
    }
    return new Web3RegistryClient(apiKey, +network, peers);
}


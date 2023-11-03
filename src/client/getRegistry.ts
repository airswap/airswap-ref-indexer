import { Peers } from "./../peer/Peers.js";
import { Web3RegistryClient } from "./Web3RegistryClient.js";

export async function getRegistry(conf: any, peers: Peers, previousChainObserved: number[]): Promise<Web3RegistryClient | null> {
    const apiKey: string = conf.API_KEY;
    const network: string = conf.NETWORK;

    if (!apiKey || !network) {
        console.error("Invalid registry configuration, apiKey, or network are incorrect, check env file !");
        return null;
    }

    const registry = new Web3RegistryClient(apiKey, peers);
    await registry.connect(+network);
    for (const chain of previousChainObserved) {
        await registry.connect(chain);
    }
    return registry;
}

import { Peers } from './../peer/Peers.js';
import { RegistryClient } from './RegistryClient.js';

export async function registerInNetwork(registryClient: RegistryClient, host: string, peers: Peers) {
    await registryClient.sendIpToRegistry(host)
    peers.broadcastMyHostToOtherPeer();
    return Promise.resolve();
}

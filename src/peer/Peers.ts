import { AxiosResponse } from 'axios';
import { PeersClient } from '../client/PeersClient.js';
import { Database } from '../database/Database.js';
import { BroadcastClient } from './../client/BroadcastClient';

export class Peers {

  peers: string[];
  database: Database;
  host: string;
  peersClient: PeersClient;
  broadcastClient: BroadcastClient;
  isSmartContract: boolean;

  constructor(database: Database, host: string, peersClient: PeersClient, broadcastClient: BroadcastClient, isSmartContract: boolean) {
    this.peers = [];
    this.database = database;
    this.host = host;
    this.peersClient = peersClient;
    this.broadcastClient = broadcastClient;
    this.isSmartContract = isSmartContract;
  };

  addPeer = (url: string) => {
    this.addPeers([url]);
  }

  addPeers = (urls: string[]) => {
    this.peers = [...new Set([...this.peers, ...urls])]
  }

  removePeer = (address: string) => {
    const peerToRemove = this.peers.filter((peerUrl) => peerUrl === address)[0];
    if (!peerToRemove) {
      return;
    }
    this.peers = this.peers.filter((client) => client != peerToRemove);
  };

  peerExists = (address: string) => {
    return !!this.peers.filter((peerUrl) => peerUrl === address)[0];
  };

  getConnectablePeers = () => {
    return this.peers.filter((host) => host != this.host);
  };

  containsUnknownPeers = (peersUrl: string[]) => {
    return peersUrl.filter((ip) => this.peers.indexOf(ip) == -1).length > 0;
  }

  broadcast = (method: string, path: string, body?: any) => {
    this.peers.forEach((clientUrl) => {
      if (clientUrl && clientUrl != this.host) {
        if (clientUrl.slice(-1) === "/") {
          clientUrl = clientUrl.slice(0, -1);
        }
        this.broadcastClient.broadcastTo(method, clientUrl + path, body);
      }
    });
  }

  broadcastMyHostToOtherPeer = () => {
    if (this.isSmartContract) return;
    console.log("Broadcasted my host to other peers");

    this.peers.forEach((clientUrl) => {
      if (clientUrl && clientUrl != this.host) {
        this.peersClient.addPeer(clientUrl, this.host);
      }
    });
  };

  broadcastDisconnectionToOtherPeer = async () => {
    if (this.isSmartContract) return;

    const promises: Promise<AxiosResponse<any, any>>[] = [];
    this.peers.forEach((clientUrl) => {
      if (clientUrl && clientUrl != this.host) {
        promises.push(this.peersClient.removePeer(clientUrl, this.host));
      }
    });
    return await Promise.all(promises);
  };

  getPeers = () => {
    return this.peers;
  };
}

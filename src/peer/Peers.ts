import { Database } from '../database/Database.js';
import { BroadcastClient } from './../client/BroadcastClient';

export class Peers {

  peers: string[];
  database: Database;
  host: string;
  broadcastClient: BroadcastClient;

  constructor(database: Database, host: string, broadcastClient: BroadcastClient) {
    this.peers = [];
    this.database = database;
    this.host = this.sanitizeUrl(host);
    this.broadcastClient = broadcastClient;
  };

  addPeer = (url: string) => {
    this.addPeers([url]);
  }

  addPeers = (urls: string[]) => {
    const sanitizedUrls = urls.map((url) => {
      return this.sanitizeUrl(url);
    });
    this.peers = [...new Set([...this.peers, ...sanitizedUrls])];
  }

  removePeer = (address: string) => {
    const peerToRemove = this.peers.filter((peerUrl) => peerUrl === address)[0];
    if (!peerToRemove) {
      return;
    }
    this.peers = this.peers.filter((client) => client != peerToRemove);
  };

  clear = () => {
    this.peers = [];
  };

  peerExists = (address: string) => {
    return !!this.peers.filter((peerUrl) => peerUrl === address)[0];
  };

  isValidHttpUrl = (stringUrl: string) => {
    if(stringUrl == '' || !stringUrl.startsWith("http")) return false
    let url;
    try {
      url = new URL(stringUrl);
    } catch (_) {
      return false;
    }
    return url.protocol === "https:";
  }


  getConnectablePeers = () => {
    return this.peers.filter((host) => host != this.host && this.isValidHttpUrl(host))
  };

  containsUnknownPeers = (peersUrl: string[]) => {
    return peersUrl.filter((url) => this.peers.indexOf(url) == -1).length > 0;
  }

  broadcast = (method: string, path: string, body?: any) => {
    this.peers.forEach((clientUrl) => {
      if (clientUrl && clientUrl != this.host) {
        this.broadcastClient.broadcastTo(method, clientUrl + path, body);
      }
    });
  }

  getPeers = () => {
    return this.peers;
  };

  private sanitizeUrl(url: string): string {
    return url.slice(-1) === "/" ? url.slice(0, -1) : url;
  }
}

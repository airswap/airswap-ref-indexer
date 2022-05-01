import { Request, Response } from 'express';
import { Peers } from '../peer/Peers.js';

export class PeersController {

  private peers: Peers;

  constructor(peers: Peers) {
    this.peers = peers;
  }

  getPeers = (request: Request, response: Response) => {
    console.log("R<---", request.method, request.url, request.body);
    response.json(this.peers.getPeers());
  }

  addPeers = (request: Request, response: Response) => {
    console.log("R<---", request.method, request.url, request.body);
    const urls = request.body.urls;
    if (!urls) {
      response.sendStatus(400);
      return;
    }
    console.log("New peers available:", urls);
    if (this.peers.containsUnknownPeers(urls)) {
      console.log("Adding new peers");
      this.peers.addPeers(urls);
      console.log("Broadcasting to others");
      this.peers.broadcast(request.method, request.url, request.body);
    }
    response.sendStatus(204);
  }

  removePeer = (request: Request, response: Response) => {
    console.log("R<---", request.method, request.url, request.body);
    const peerUrl = request.params.peerUrl;
    if (!peerUrl) {
      response.sendStatus(400);
      return;
    }
    if (this.peers.peerExists(peerUrl)) {
      this.peers.removePeer(peerUrl);
      this.peers.broadcast(request.method, request.url, request.body);
    }
    response.sendStatus(204);
  }
}



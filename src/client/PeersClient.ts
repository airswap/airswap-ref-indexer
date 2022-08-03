import axios from 'axios';

const peersPath = "/peers/";
export class PeersClient {

    async getPeers(url: string) {
        console.log("S---> GET" + url + peersPath);
        return Promise.resolve();//axios.get(url + peersPath)
    }
    async addPeer(url: string, peer: string) {
        console.log("S---> POST", url + peersPath, { urls: [peer] });
        return Promise.resolve();// axios.post(url + peersPath, { urls: [peer] })
    }
    async removePeer(url: string, peerUrl: string) {
        console.log("S---> DELETE", url + peersPath + peerUrl);
        return Promise.resolve();// axios.delete(url + peersPath + peerUrl);
    }
}
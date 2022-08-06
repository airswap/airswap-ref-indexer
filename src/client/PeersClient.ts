import axios from 'axios';

const peersPath = "/peers/";
export class PeersClient {

    async getPeers(url: string) {
        console.log("S---> GET" + url + peersPath);
        return axios.get(url + peersPath)
    }
    async addPeer(url: string, peer: string) {
        console.log("S---> POST", url + peersPath, { urls: [peer] });
        return axios.post(url + peersPath, { urls: [peer] })
    }
    async removePeer(url: string, peerUrl: string) {
        const encodedPeer = Buffer.from(peerUrl, 'ascii').toString('base64');
        console.log("S---> DELETE", url + peersPath + encodedPeer);
        return axios.delete(url + peersPath + encodedPeer);
    }
}
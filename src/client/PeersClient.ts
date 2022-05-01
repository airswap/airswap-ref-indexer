import axios from 'axios';
import { BroadcastClient } from "./BroadcastClient.js";

const peersPath = "/peers/";
export class PeersClient implements BroadcastClient {

    async getPeers(url: string) {
        console.log("S---> GET" + url + peersPath);
        return axios.get(url + peersPath)
    }
    async addPeer(url: string, peer: string) {
        console.log("S---> POST", url + peersPath, { urls: [peer] });
        return axios.post(url + peersPath, { urls: [peer] })
    }
    async removePeer(url: string, peerUrl: string) {
        console.log("S---> DELETE", url + peersPath + peerUrl);
        return axios.delete(url + peersPath + peerUrl);
    }

    async sendTo(method: string, url: string, data?: any) {
        console.log("S--->", method, url, data);
        try {
            switch (method) {
                case "GET":
                    return await axios.get(url);
                case "POST":
                    return await axios.post(url, data);
                case "PUT":
                    return await axios.put(url, data);
                case "DELETE":
                    return await axios.delete(url);
            }
        } catch (e) {
            console.log("Client did not answer !", method, url, data, e);
        }
    }
}
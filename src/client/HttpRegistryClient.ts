import axios from "axios";
import { RegistryClient } from './RegistryClient.js';

export class HttpRegistryClient implements RegistryClient {
  registry: string;

  constructor(registry: string) {
    this.registry = registry;
  }

  async getPeersFromRegistry(): Promise<string[]> {
    console.log("S---> GET", this.registry);
    const response = await axios.get(this.registry);
    return Promise.resolve(response.data?.peers || [])
  }

  async sendIpToRegistry(url: string): Promise<void> {
    console.log("S---> POST", `${this.registry}`, { url: url });
    console.log("Ip sent to registry");
    return await axios.post(`${this.registry}`, { url: url });
  }

  async removeIpFromRegistry(url: string): Promise<void> {
    const encodedPeer = Buffer.from(url, 'ascii').toString('base64');
    console.log("S---> DELETE", `${this.registry}/` + encodedPeer);
    return await axios.delete(`${this.registry}/` + encodedPeer);
  }
}
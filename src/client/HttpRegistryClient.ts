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

  async sendIpToRegistry(ip: string): Promise<void> {
    console.log("S---> POST", `${this.registry}`, { ip });
    return await axios.post(`${this.registry}`, { ip });
  }

  async removeIpFromRegistry(ip: string): Promise<void> {
    console.log("S---> DELETE", `${this.registry}/` + ip);
    return await axios.delete(`${this.registry}/` + ip);
  }
}
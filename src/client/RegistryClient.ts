import axios from "axios";

export class RegistryClient {
  registry: string;

  constructor(registry: string) {
    this.registry = registry;
  }

  async getPeersFromRegistry(): Promise<any> {
    console.log("S---> GET", this.registry);
    return await axios.get(this.registry);
  }

  sendIpToRegistry(ip: string) {
    console.log("S---> POST", `${this.registry}`, { ip });
    return axios.post(`${this.registry}`, { ip });
  }

  removeIpFromRegistry(ip: string) {
    console.log("S---> DELETE", `${this.registry}/remove/` + ip);
    return axios.delete(`${this.registry}/` + ip);
  }
}
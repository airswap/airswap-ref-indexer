import axios from "axios";

export interface RegistryClient {
  getPeersFromRegistry(): Promise<any>;

  sendIpToRegistry(ip: string): Promise<void>;

  removeIpFromRegistry(ip: string): Promise<void>;
}
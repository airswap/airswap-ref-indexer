import axios from "axios";

export interface RegistryClient {
  getPeersFromRegistry(): Promise<string[]>;

  sendIpToRegistry(ip: string): Promise<void>;

  removeIpFromRegistry(ip: string): Promise<void>;
}
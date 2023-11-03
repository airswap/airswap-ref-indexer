import { apiUrls } from "@airswap/constants";
import { ethers } from "ethers";

export function getProviderUrl(chainId: number, apiKey: string) {
    const host = apiUrls[chainId];

    if (!host) {
        throw new Error("Unknown chain ID");
    }

    return host.includes("infura.io/v3")
        ? new ethers.providers.WebSocketProvider(`${host.replace(/^http/i, "ws").replace("/v3", "/ws/v3")}/${apiKey}`)
        : new ethers.providers.JsonRpcProvider(host);
}

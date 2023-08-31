import {apiUrls} from '@airswap/constants'

export function getProviderUrl(chainId: number, apiKey: string) {
    const host = apiUrls[chainId];
    
    if (!host) {
        throw new Error("Unknown chain ID");
    }
    
    return host.includes("infura.io/v3") ? `wss://${host}/${apiKey}` : `https://${host}`;
}

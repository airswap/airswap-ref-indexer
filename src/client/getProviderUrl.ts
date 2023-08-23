import {apiUrls} from '@airswap/constants'

export function getProviderUrl(chainId: number) {
    const host = apiUrls[chainId];
    
    if (!host) {
        throw new Error("Unknown chain ID");
    }
    
    return `https://${host}`;
}

const hostByChainId: Record<number, string> =
{
    1: "https://mainnet.infura.io/v3",
    5: "https://goerli.infura.io/v3",
    11155111: "https://sepolia.infura.io/v3",
    59144: "https://linea-mainnet.infura.io/v3",
    59140: "https://linea-goerli.infura.io/v3",
    137: "https://polygon-mainnet.infura.io/v3",
    80001: "https://polygon-mumbai.infura.io/v3",
    10: "https://optimism-mainnet.infura.io/v3",
    420: "https://optimism-goerli.infura.io/v3",
    42161: "https://arbitrum-mainnet.infura.io/v3",
    421613: "https://arbitrum-goerli.infura.io/v3",
    11297108109: "https://palm-mainnet.infura.io/v3",
    11297108099: "https://palm-testnet.infura.io/v3",
    43114: "https://avalanche-mainnet.infura.io/v3",
    43113: "https://avalanche-fuji.infura.io/v3",
    1313161554: "https://aurora-mainnet.infura.io/v3",
    1313161555: "https://aurora-testnet.infura.io/v3",
    42220: "https://celo-mainnet.infura.io/v3",
    44787: "https://celo-alfajores.infura.io/v3"
}

export function getProviderUrl(chainId: number, apiKey: string) {
    const host = hostByChainId[chainId];
    if (!host) {
        throw new Error("Unknown chain ID");
    }
    return `https://${host}/${apiKey}`;
}

import { ethers } from "ethers";
import { isNumeric } from "../validator/index.js";

export function getNetwork(network: string | number): string {
    let mappedNetwork = `${network}`;
    if (typeof network === 'number' || isNumeric(network)) {
        mappedNetwork = ethers.providers.getNetwork(+network)?.name;
    }
    return mappedNetwork;
}
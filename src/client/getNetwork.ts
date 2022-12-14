import { ethers } from "ethers";
import { isNumeric } from "../validator/index.js";

export function getNetwork(network: string) {
    let mappedNetwork = network;
    if (isNumeric(network)) {
        mappedNetwork = ethers.providers.getNetwork(+network)?.name;
    }
    return mappedNetwork;
}
import { getLocalIp, getPublicIp } from "./ip_helper.js";

export async function getNodeUrl(serverPort: string, isLocalOnly: string, nodeUrl?: string): Promise<string> {
    if (nodeUrl == undefined || nodeUrl === "") {
        const hostname = isLocalOnly === "1"
            ? `${getLocalIp()}:${serverPort}`
            : `${await getPublicIp()}:${serverPort}`;
        return Promise.resolve(`http://${hostname}/`);
    }
    return Promise.resolve(nodeUrl as string);
}
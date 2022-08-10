import axios from 'axios';

export class OrderClient {
    async getOrders(url: string) {
        const body = {
            jsonrpc: "2.0",
            id: "1",
            method: "getOrders",
            params: [{}]
        };
        console.log("S---> POST", url, body);
        const response = await axios.post(url, body);
        return { data: response?.data?.result };
    }
}
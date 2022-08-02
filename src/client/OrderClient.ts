import axios from 'axios';
import { IndexedOrder } from '../model/IndexedOrder.js';

const orderPath = "/orders/";
export class OrderClient {
    async getOrders(url: string) {
        console.log("S---> GET", url + orderPath);
        return await axios.get(url + orderPath)
    }
    async getOrders_JSON_RPC(url: string) {
        console.log("S---> POST", url);
        const response = await axios.post(url, {
            jsonrpc: "2.0",
            id: "1",
            method: "getOrders",
            params: [{}]
        });
        return { data: response?.data?.result };
    }
    async addOrder(url: string, IndexedOrder: IndexedOrder) {
        console.log("S---> POST", url + orderPath, IndexedOrder);
        return await axios.post(url + orderPath, IndexedOrder)
    }
    async delete(url: string, hash: string) {
        console.log("S---> DELETE", url + orderPath + hash);
        return await axios.delete(url + orderPath + hash);
    }
}
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
        const response = await axios.post(url);
        return { data: response?.data?.result };
    }
    async addOrder(url: string, IndexedOrder: IndexedOrder) {
        console.log("S---> POST", url + orderPath, IndexedOrder);
        return await axios.post(url + orderPath, IndexedOrder)
    }
    async delete(url: string, orderHash: string) {
        console.log("S---> DELETE", url + orderPath + orderHash);
        return await axios.delete(url + orderPath + orderHash);
    }
}
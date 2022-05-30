import axios from 'axios';
import { OtcOrder } from '../model/OtcOrder.js';

const orderPath = "/orders/";
export class OrderClient {
    async getOrders(url: string) {
        console.log("S---> GET", url + orderPath);
        return await axios.get(url + orderPath)
    }
    async addOrder(url: string, OtcOrder: OtcOrder) {
        console.log("S---> POST", url + orderPath, OtcOrder);
        return await axios.post(url + orderPath, OtcOrder)
    }
    async delete(url: string, orderId: string) {
        console.log("S---> DELETE", url + orderPath + orderId);
        return await axios.delete(url + orderPath + orderId);
    }
}
import axios from 'axios';
import { Order } from '../model/Order.js';

const orderPath = "/orders/";
export class OrderClient {
    async getOrders(url: string) {
        console.log("S---> GET", url + orderPath);
        return await axios.get(url + orderPath)
    }
    async addOrder(url: string, order: Order) {
        console.log("S---> POST", url + orderPath, order);
        return await axios.post(url + orderPath, order)
    }
    async delete(url: string, orderId: string) {
        console.log("S---> DELETE", url + orderPath + orderId);
        return await axios.delete(url + orderPath + orderId);
    }
}
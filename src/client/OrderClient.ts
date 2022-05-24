import axios from 'axios';
import { BroadcastClient } from "./BroadcastClient.js";
import { Order } from '../model/Order.js';
import { TransactionStatus } from '../model/TransactionStatus.js';

const orderPath = "/orders/";
export class OrderClient {
    async getorders(url: string) {
        console.log("S---> GET", url + orderPath);
        return await axios.get(url + orderPath)
    }
    async addOrder(url: string, order: Order) {
        console.log("S---> POST", url + orderPath, order);
        return await axios.post(url + orderPath, order)
    }
    async editOrder(url: string, orderId: string, status: TransactionStatus) {
        console.log("S---> PUT", url + orderPath + orderId, { status });
        return await axios.put(url + orderPath + orderId, {
            status
        });
    }
}
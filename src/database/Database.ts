import { Order } from './../model/Order.js';

export interface Database {
    addOrder(order: Order): Promise<void>;

    addAll(orders: Record<string, Order>):  Promise<void>;

    deleteOrder(id: String):  Promise<void>;

    getOrder(id: string): Promise<Order>;
    
    getOrders(): Promise<Record<string, Order>>;
        
    getOrderBy(signerToken?: string, senderToken?: string, minSignerAmount?: number, maxSignerAmount?: number, minSenderAmount?: number, maxSenderAmount?: number): Promise<Record<string, Order>>;

    orderExists(id: string): Promise<boolean>;

    generateId(order: Order): string;
}
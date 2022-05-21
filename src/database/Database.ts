import { Order } from './../model/Order.js';
import { TransactionStatus } from './../model/TransactionStatus.js';
export interface Database {
    addOrder(order: Order): void;

    addAll(orders: Record<string, Order>): void;

    editOrder(id: string, status: TransactionStatus): void;

    getOrder(id: string): Promise<Order>;
    
    getOrders(): Promise<Record<string, Order>>;
        
    getOrderBy(fromToken: string, toToken: string, minFromToken: number, maxFromToken: number, minToToken: number, maxToToken: number): Promise<Record<string, Order>>;

    orderExists(id: string): Promise<boolean>;

    generateId(order: Order): string;
}
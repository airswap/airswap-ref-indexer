import { OtcOrder } from '../model/OtcOrder.js';

export interface Database {
    addOrder(OtcOrder: OtcOrder): Promise<void>;

    addAll(orders: Record<string, OtcOrder>):  Promise<void>;

    deleteOrder(id: String):  Promise<void>;

    getOrder(id: string): Promise<Record<string, OtcOrder>>;
    
    getOrders(): Promise<Record<string, OtcOrder>>;
        
    getOrderBy(signerToken?: string, senderToken?: string, minSignerAmount?: number, maxSignerAmount?: number, minSenderAmount?: number, maxSenderAmount?: number): Promise<Record<string, OtcOrder>>;

    orderExists(id: string): Promise<boolean>;

    generateId(otcOrder: OtcOrder): string;
}
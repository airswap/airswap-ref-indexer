import { ErrorResponse } from './ErrorResponse';
import { OrderResponse } from './OrderResponse';

export class JsonRpcResponse {
    private jsonrpc = '2.0';
    private id: string;
    private result: OrderResponse | ErrorResponse | undefined;

    constructor(id: string, result: OrderResponse | ErrorResponse | undefined) {
        this.id = id;
        this.result = result;
    }
}
import { OrderResponse } from './OrderResponse';
export class ErrorResponse {
    private code: number;
    private message: string;

    constructor(code: number, message: string) {
        this.code = code;
        this.message = message;
    }
}
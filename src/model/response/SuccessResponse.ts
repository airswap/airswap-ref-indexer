//@todo: check if is used
export class SuccessResponse {
    public code: number;
    public message: string
    constructor(code: number, message: string) {
        this.code = code;
        this.message = message;
    }
}
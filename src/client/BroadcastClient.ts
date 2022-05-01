export interface BroadcastClient {
    sendTo(method: string, url: string, data?: any): void
}
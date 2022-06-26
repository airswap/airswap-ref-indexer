import { AmountLimitFilter } from './AmountLimitFilter.js';

export class Filters {
    signerToken: Record<string, AmountLimitFilter>
    senderToken: Record<string, AmountLimitFilter>

    constructor() {
        this.signerToken = {}
        this.senderToken = {}
    }

    addSignerToken(token: string, amount: number): void {
        this.editTokenMap(this.signerToken, token.toLowerCase(), amount);
    }

    addSenderToken(token: string, amount: number): void {
        this.editTokenMap(this.senderToken, token.toLowerCase(), amount);
    }

    private editTokenMap(map: Record<string, AmountLimitFilter>, token: string, amount: number): void {
        if (amount < 0) {
            return;
        }
        
        if (!map[token]) {
            map[token] = new AmountLimitFilter(amount, amount);
        } else {
            if (map[token].max < amount) {
                map[token].max = amount;
            }
            if (map[token].min > amount) {
                map[token].min = amount;
            }
        }
    }
}
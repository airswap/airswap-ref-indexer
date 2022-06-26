export class Pagination {
    first: string = undefined;
    last: string = undefined;
    prev: string = undefined;
    next: string = undefined;

    constructor(first?: string, last?: string, next?: string, prev?: string) {
        this.first = first;
        this.last = last;
        this.prev = prev;
        this.next = next;
    }
}


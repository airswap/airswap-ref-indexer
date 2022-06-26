export class Pagination {
    first: string | undefined = undefined;
    last: string | undefined = undefined;
    prev: string | undefined = undefined;
    next: string | undefined = undefined;

    constructor(first?: string, last?: string, next?: string, prev?: string) {
        this.first = first;
        this.last = last;
        this.prev = prev;
        this.next = next;
    }
}


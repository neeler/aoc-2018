export class LinkedListNode<T> {
    public next: LinkedListNode<T> | null = null;
    public prev: LinkedListNode<T> | null = null;

    constructor(public value: T) {}
}

export class LinkedList<T> {
    head: LinkedListNode<T> | null = null;
    tail: LinkedListNode<T> | null = null;
    size = 0;
    readonly isCycle: boolean;

    constructor({ isCycle = false }: { isCycle?: boolean } = {}) {
        this.isCycle = isCycle;
    }

    append(value: T): LinkedListNode<T> {
        const node = new LinkedListNode(value);

        if (!this.head) {
            this.head = node;
            this.tail = node;
        } else {
            this.tail!.next = node;
            node.prev = this.tail;
            this.tail = node;
        }

        if (this.isCycle) {
            this.tail.next = this.head;
            this.head.prev = this.tail;
        }

        this.size++;

        return node;
    }

    remove(node: LinkedListNode<T>): void {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }

        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this.tail = node.prev;
        }

        this.size--;

        if (this.isCycle && this.size > 0) {
            this.tail!.next = this.head;
            this.head!.prev = this.tail;
        }
    }

    insertAfter(node: LinkedListNode<T>, value: T) {
        const newNode = new LinkedListNode(value);
        newNode.next = node.next;
        if (newNode.next) {
            newNode.next.prev = newNode;
        }
        newNode.prev = node;
        node.next = newNode;

        if (this.tail === node) {
            this.tail = newNode;
        }

        this.size++;

        return newNode;
    }

    insertBefore(node: LinkedListNode<T>, value: T) {
        const newNode = new LinkedListNode(value);
        newNode.prev = node.prev;
        if (newNode.prev) {
            newNode.prev.next = newNode;
        }
        newNode.next = node;
        node.prev = newNode;

        if (this.head === node) {
            this.head = newNode;
        }

        this.size++;

        return newNode;
    }

    getNFrom(node: LinkedListNode<T>, n: number): LinkedListNode<T> | null {
        if (n === 0) {
            return node;
        }

        let current: LinkedListNode<T> | null = node;
        const iters = Math.abs(n);
        for (let i = 0; current && i < iters; i++) {
            current = n < 0 ? current.prev : current.next;
        }

        return current;
    }

    *nodes(): Generator<LinkedListNode<T>> {
        let current = this.head;
        const nodesSeen = new Set<LinkedListNode<T>>();

        while (current && !nodesSeen.has(current)) {
            nodesSeen.add(current);
            yield current;
            current = current.next;
        }
    }

    toArray(): T[] {
        const arr: T[] = [];
        let current = this.head;
        const nodesSeen = new Set<LinkedListNode<T>>();

        while (current && !nodesSeen.has(current)) {
            nodesSeen.add(current);
            arr.push(current.value);
            current = current.next;
        }

        return arr;
    }
}

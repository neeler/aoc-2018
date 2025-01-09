/**
 * Essentially it's a Set where you can define what is used
 * to determine identity/equality.
 *
 * Really it's a wrapper around a Map.
 */
export class CustomSet<TData, TKey = string> {
    private itemMap = new Map<TKey, TData>();

    constructor(
        private readonly config: {
            getKey: (item: TData) => TKey;
        },
    ) {}

    static from<TData, TKey = string>(
        items: Iterable<TData>,
        getKey: (item: TData) => TKey,
    ) {
        const customSet = new CustomSet<TData, TKey>({ getKey });
        for (const item of items) {
            customSet.add(item);
        }
        return customSet;
    }

    add(item: TData): void {
        const key = this.config.getKey(item);

        if (!this.itemMap.has(key)) {
            this.itemMap.set(key, item);
        }
    }

    get(key: TKey): TData | undefined {
        return this.itemMap.get(key);
    }

    getLike(item: TData): TData | undefined {
        return this.get(this.config.getKey(item));
    }

    getKey(item: TData): TKey {
        return this.config.getKey(item);
    }

    delete(item: TData): void {
        this.deleteKey(this.config.getKey(item));
    }

    clear(): void {
        this.itemMap = new Map<TKey, TData>();
    }

    has(item: TData) {
        return this.hasKey(this.config.getKey(item));
    }

    hasKey(key: TKey): boolean {
        return this.itemMap.has(key);
    }

    deleteKey(key: TKey): void {
        if (this.itemMap.has(key)) {
            this.itemMap.delete(key);
        }
    }

    keys(): MapIterator<TKey> {
        return this.itemMap.keys();
    }

    values(): MapIterator<TData> {
        return this.itemMap.values();
    }

    get size(): number {
        return this.itemMap.size;
    }
}

export function findBy<T>(
    iterable: Iterable<T>,
    predicate: (item: T) => any,
): T | undefined {
    for (const item of iterable) {
        if (predicate(item)) {
            return item;
        }
    }
    return undefined;
}

export function findBestBy<T>(
    iterable: Iterable<T>,
    predicate: (item1: T, item2: T) => boolean,
): T {
    let best: T | undefined;
    for (const item of iterable) {
        if (!best || !predicate(best, item)) {
            best = item;
        }
    }
    if (!best) {
        throw new Error('No best found because empty iterable');
    }
    return best;
}

export function sumOf<T>(
    iterable: Iterable<T>,
    fn: (item: T) => number,
): number {
    let sum = 0;
    for (const item of iterable) {
        sum += fn(item);
    }
    return sum;
}

export function maxOf<T>(
    iterable: Iterable<T>,
    fn: (item: T) => number,
): number {
    let max = -Infinity;
    for (const item of iterable) {
        const value = fn(item);
        if (value > max) {
            max = value;
        }
    }
    return max;
}

export function minOf<T>(
    iterable: Iterable<T>,
    fn: (item: T) => number,
): number {
    let max = Infinity;
    for (const item of iterable) {
        const value = fn(item);
        if (value < max) {
            max = value;
        }
    }
    return max;
}

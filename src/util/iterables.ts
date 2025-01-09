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
    predicate: (item1: T, item2: T) => T,
): T {
    let best: T | undefined;
    for (const item of iterable) {
        if (!best) {
            best = item;
        } else {
            best = predicate(best, item);
        }
    }
    if (!best) {
        throw new Error('No best found');
    }
    return best;
}

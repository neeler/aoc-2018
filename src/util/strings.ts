import { range } from '~/util/range';

export function countCharacters(s: string) {
    const charCounts = new Map<string, number>();

    for (const char of s.split('')) {
        charCounts.set(char, (charCounts.get(char) ?? 0) + 1);
    }

    return charCounts;
}

export function stringSplice(
    s: string,
    start: number,
    deleteCount: number,
    stringToInsert = '',
) {
    return s.slice(0, start) + stringToInsert + s.slice(start + deleteCount);
}

export const alphanumericCharCodes = range(48, 58)
    .concat(range(65, 91))
    .concat(range(97, 123));

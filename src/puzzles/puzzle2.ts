import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { countCharacters } from '~/util/strings';

export const puzzle2 = new Puzzle({
    day: 2,
    parseInput: (fileData) => {
        return splitFilter(fileData);
    },
    part1: (ids) => {
        let twos = 0;
        let threes = 0;
        ids.forEach((id) => {
            const counts = new Set(countCharacters(id).values());
            if (counts.has(2)) twos++;
            if (counts.has(3)) threes++;
        });
        return twos * threes;
    },
    part2: (ids) => {
        const shortIdSet = new Set<string>();
        for (const id of ids) {
            for (let i = 0; i < id.length; i++) {
                const shortId = `${id.slice(0, i)}${id.slice(i + 1)}-${i}`;
                if (shortIdSet.has(shortId)) {
                    return shortId.split('-')[0];
                }
                shortIdSet.add(shortId);
            }
        }
        throw new Error('No solution found');
    },
});

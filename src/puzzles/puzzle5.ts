import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

export const puzzle5 = new Puzzle({
    day: 5,
    parseInput: (fileData) => {
        return splitFilter(fileData, '');
    },
    part1: (polymer) => {
        return react(polymer).length;
    },
    part2: (polymer) => {
        const reactedPolymer = react(polymer);
        const chars = new Set(reactedPolymer.map((c) => c.toLowerCase()));

        let shortestLength = Infinity;
        for (const char of chars) {
            const newPolymer = reactedPolymer.filter(
                (c) => c.toLowerCase() !== char,
            );
            shortestLength = Math.min(shortestLength, react(newPolymer).length);
        }
        return shortestLength;
    },
});

function react(polymer: string[]) {
    for (let i = 0; i < polymer.length - 1; i++) {
        const char = polymer[i]!;
        const nextChar = polymer[i + 1]!;
        if (
            char.toLowerCase() === nextChar.toLowerCase() &&
            char !== nextChar
        ) {
            polymer.splice(i, 2);
            i = Math.max(-1, i - 2);
        }
    }
    return polymer;
}

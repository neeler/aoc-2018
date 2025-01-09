import { Puzzle } from './Puzzle';
import { getNumbers } from '~/util/parsing';
import { sum } from '~/util/arithmetic';

export const puzzle1 = new Puzzle({
    day: 1,
    parseInput: (fileData) => {
        return getNumbers(fileData);
    },
    part1: (freqs) => {
        return sum(freqs);
    },
    part2: (freqs) => {
        const freqsSeen = new Set<number>();
        let currentFreq = 0;
        freqsSeen.add(currentFreq);

        let iFreq = 0;
        while (true) {
            const freq = freqs[iFreq % freqs.length]!;
            currentFreq += freq;

            if (freqsSeen.has(currentFreq)) {
                return currentFreq;
            }

            freqsSeen.add(currentFreq);

            iFreq++;
        }
    },
});

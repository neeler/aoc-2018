import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { sumOf } from '~/util/iterables';

type PotState = Map<number, boolean>;

class Rule {
    readonly test: boolean[];
    readonly result: boolean;

    constructor(rule: string) {
        const [before, after] = rule.split(' => ') as [string, string];
        this.test = before.split('').map((c) => c === '#');
        this.result = after === '#';
    }

    isMatch(state: PotState, index: number): boolean {
        return this.test.every((val, idx) => {
            return val === (state.get(index + idx - 2) ?? false);
        });
    }
}

export const puzzle12 = new Puzzle({
    day: 12,
    parseInput: (fileData) => {
        const [str1 = '', str2 = ''] = splitFilter(fileData, '\n\n');
        const initialState: PotState = new Map(
            str1
                .slice(15)
                .split('')
                .map((c, index) => [index, c === '#']),
        );
        return {
            initialState,
            rules: splitFilter(str2, '\n').map((rule) => new Rule(rule)),
        };
    },
    part1: ({ initialState, rules }) => {
        return grow(initialState, rules, 20);
    },
    part2: ({ initialState, rules }) => {
        return grow(initialState, rules, 50000000000);
    },
});

function countIndexes(state: PotState) {
    return sumOf(state.entries(), ([index, state]) => (state ? index : 0));
}

function grow(
    initialState: PotState,
    rules: Rule[],
    generations: number,
): number {
    let state: PotState = new Map(initialState);
    let previousCount = countIndexes(state);
    let previousDiff = 0;
    let nSameDiffsSeen = 0;

    for (let i = 0; i < generations; i++) {
        const newState: PotState = new Map();
        const indexesSeen = new Set<number>();

        for (const index of state.keys()) {
            for (let j = index - 2; j <= index + 2; j++) {
                if (!indexesSeen.has(j)) {
                    indexesSeen.add(j);
                    const validRule = rules.find((rule) =>
                        rule.isMatch(state, j),
                    );
                    if (validRule?.result) {
                        newState.set(j, true);
                    }
                }
            }
        }

        state = newState;

        const newCount = countIndexes(state);
        const newDiff = newCount - previousCount;
        if (newDiff === previousDiff) {
            nSameDiffsSeen++;
        } else {
            previousDiff = newDiff;
            nSameDiffsSeen = 1;
        }

        previousCount = newCount;

        if (nSameDiffsSeen > 100) {
            // The pattern has stabilized, so we can extrapolate the rest
            return newCount + newDiff * (generations - i - 1);
        }
    }

    return previousCount;
}

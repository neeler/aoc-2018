import { Puzzle } from './Puzzle';
import { getNumbers } from '~/util/parsing';
import { LinkedList } from '~/types/LinkedList';

export const puzzle9 = new Puzzle({
    day: 9,
    parseInput: (fileData) => {
        const [nPlayers, lastMarble] = getNumbers(fileData) as [number, number];
        return {
            nPlayers,
            nMarbles: lastMarble + 1,
        };
    },
    part1: ({ nPlayers, nMarbles }) => {
        return getMaxScore({
            nPlayers,
            nMarbles,
        });
    },
    part2: ({ nPlayers, nMarbles }) => {
        return getMaxScore({
            nPlayers,
            nMarbles: nMarbles * 100,
        });
    },
});

function getMaxScore({
    nPlayers,
    nMarbles,
}: {
    nPlayers: number;
    nMarbles: number;
}) {
    const playerScores = Array.from({ length: nPlayers }, () => 0);

    const linkedList = new LinkedList<number>({
        isCycle: true,
    });
    let currentMarble = linkedList.append(0);
    let iPlayer = 0;

    for (let marble = 1; marble < nMarbles; marble++) {
        if (marble % 23 === 0) {
            playerScores[iPlayer]! += marble;

            const nextToRemove = linkedList.getNFrom(currentMarble, -7)!;
            currentMarble = nextToRemove.next!;

            playerScores[iPlayer]! += nextToRemove.value;
            linkedList.remove(nextToRemove);
        } else {
            currentMarble = linkedList.insertAfter(currentMarble.next!, marble);
        }

        iPlayer = (iPlayer + 1) % nPlayers;
    }

    return Math.max(...playerScores);
}

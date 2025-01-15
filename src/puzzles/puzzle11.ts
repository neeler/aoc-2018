import { Puzzle } from './Puzzle';
import { getNumbers } from '~/util/parsing';
import { Grid } from '~/types/grid';

export const puzzle11 = new Puzzle({
    day: 11,
    parseInput: (fileData) => {
        const serialNumber = getNumbers(fileData)[0]!;
        return new Grid<number>({
            width: 300,
            height: 300,
            defaultValue: ({ row, col }) => {
                const rackId = col + 11;
                let powerLevel = rackId * (row + 1);
                powerLevel += serialNumber;
                powerLevel *= rackId;
                const powerString = powerLevel
                    .toString()
                    .padStart(3, '0')
                    .split('');
                powerLevel = Number(powerString[powerString.length - 3]);
                powerLevel -= 5;
                return powerLevel;
            },
        });
    },
    part1: (grid) => {
        let bestNode = grid.get({ row: 0, col: 0 })!;
        let bestSum = 0;
        const maxRow = grid.height - 3;
        const maxCol = grid.width - 3;
        for (let row = 0; row < maxRow; row++) {
            for (let col = 0; col < maxCol; col++) {
                let sum = 0;
                for (let y = 0; y < 3; y++) {
                    for (let x = 0; x < 3; x++) {
                        sum += grid.get({ row: row + y, col: col + x })!.data;
                    }
                }
                if (sum > bestSum) {
                    bestNode = grid.get({ row, col })!;
                    bestSum = sum;
                }
            }
        }
        return `${bestNode.col + 1},${bestNode.row + 1}`;
    },
    part2: (grid) => {
        let bestNode = grid.get({ row: 0, col: 0 })!;
        let bestSum = 0;
        let bestSquareSize = 0;
        for (let row = 0; row < grid.height; row++) {
            for (let col = 0; col < grid.width; col++) {
                const maxSquareSize = Math.min(
                    grid.height - row,
                    grid.width - col,
                );
                let sum = 0;
                for (
                    let nSquaresExtra = 0;
                    nSquaresExtra < maxSquareSize;
                    nSquaresExtra++
                ) {
                    for (let y = 0; y < nSquaresExtra; y++) {
                        sum += grid.get({
                            row: row + y,
                            col: col + nSquaresExtra,
                        })!.data;
                    }
                    for (let x = 0; x < nSquaresExtra; x++) {
                        sum += grid.get({
                            row: row + nSquaresExtra,
                            col: col + x,
                        })!.data;
                    }
                    sum += grid.get({
                        row: row + nSquaresExtra,
                        col: col + nSquaresExtra,
                    })!.data;
                    if (sum > bestSum) {
                        bestNode = grid.get({ row, col })!;
                        bestSum = sum;
                        bestSquareSize = nSquaresExtra + 1;
                    }
                }
            }
        }
        return `${bestNode.col + 1},${bestNode.row + 1},${bestSquareSize}`;
    },
});

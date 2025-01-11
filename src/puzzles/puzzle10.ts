import { Puzzle } from './Puzzle';
import { getNumbersForEachLine } from '~/util/parsing';
import {
    addCoordinates,
    Grid,
    GridCoordinate,
    GridCoordinateSet,
} from '~/types/grid';
import { getBigAsciiCharacter } from '~/util/ascii';

interface Point {
    position: GridCoordinate;
    velocity: GridCoordinate;
}

export const puzzle10 = new Puzzle({
    day: 10,
    parseInput: (fileData, { example }) => {
        const points = getNumbersForEachLine(fileData).map(
            ([col, row, dCol, dRow]): Point => {
                return {
                    position: { row, col } as GridCoordinate,
                    velocity: { row: dRow, col: dCol } as GridCoordinate,
                };
            },
        );
        let message = '';
        let iSec = 0;
        while (true) {
            const grid = getPointGrid(points, example ? 8 : 10);

            if (grid) {
                if (example) {
                    message = 'HI';
                    break;
                }
                const columnsPerLetter: number[][] = [[]];
                let currentLetter = 0;
                for (let col = 0; col < grid.width; col++) {
                    const letterColumns = columnsPerLetter[currentLetter]!;
                    const data = grid.getColumn(col);
                    const isEmpty =
                        data?.every((node) => node.data === '.') ?? true;
                    if (isEmpty) {
                        if (letterColumns.length > 0) {
                            currentLetter++;
                            columnsPerLetter.push([]);
                        }
                    } else {
                        letterColumns.push(col);
                    }
                }
                const letterStarts = columnsPerLetter.map(
                    (columns) => columns[0]!,
                );
                const chars: string[] = [];
                for (const col of letterStarts) {
                    const letterGrid = grid.getSubGrid({
                        row: 0,
                        col,
                        width: 7,
                        height: grid.height,
                        blankValue: '.',
                    });
                    const strings = letterGrid.grid.map((row) =>
                        row.map((node) => node.data).join(''),
                    );
                    chars.push(getBigAsciiCharacter(strings));
                }
                message = chars.join('');
                break;
            }

            movePoints(points);
            iSec++;
        }
        return {
            points,
            message,
            iSec,
        };
    },
    part1: ({ message }) => {
        return message;
    },
    part2: ({ iSec }) => {
        return iSec;
    },
});

function movePoints(points: Point[]) {
    for (const point of points) {
        point.position = addCoordinates(point.position, point.velocity);
    }
}

function getPointGrid(points: Point[], targetHeight: number) {
    let minRow = Infinity;
    let minCol = Infinity;
    let maxRow = -Infinity;
    let maxCol = -Infinity;
    for (const { position } of points) {
        minRow = Math.min(minRow, position.row);
        minCol = Math.min(minCol, position.col);
        maxRow = Math.max(maxRow, position.row);
        maxCol = Math.max(maxCol, position.col);
    }
    const width = maxCol - minCol + 1;
    const height = maxRow - minRow + 1;

    if (height !== targetHeight) {
        return null;
    }

    const pointSet = new GridCoordinateSet();
    for (const { position } of points) {
        pointSet.add({
            row: position.row - minRow,
            col: position.col - minCol,
        });
    }
    return new Grid<string>({
        width,
        height,
        defaultValue: (p) => (pointSet.has(p) ? '#' : '.'),
        drawFn: (node) => node.data,
    });
}

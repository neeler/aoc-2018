import { CustomSet } from '~/types/CustomSet';
import { Direction, DirectionsToDiffs } from '~/types/grid/Directions';

export interface GridCoordinate {
    row: number;
    col: number;
}

export class GridCoordinateSet extends CustomSet<GridCoordinate> {
    constructor(positions?: Iterable<GridCoordinate>) {
        super({
            getKey: ({ row, col }) => `${row},${col}`,
        });
        if (positions) {
            for (const position of positions) {
                this.add(position);
            }
        }
    }
}

export function getCoordsInDirection(
    pos: GridCoordinate,
    direction: Direction,
    distance = 1,
): GridCoordinate {
    const baseDiff = DirectionsToDiffs[direction];
    const diff = mulCoordinates(baseDiff, distance);
    return addCoordinates(pos, diff);
}

export function addCoordinates(
    a: GridCoordinate,
    b: GridCoordinate,
): GridCoordinate {
    return {
        row: a.row + b.row,
        col: a.col + b.col,
    };
}

export function mulCoordinates(
    a: GridCoordinate,
    b: GridCoordinate | number,
): GridCoordinate {
    return {
        row: a.row * (typeof b === 'number' ? b : b.row),
        col: a.col * (typeof b === 'number' ? b : b.col),
    };
}

export function manhattanDistance(p1: GridCoordinate, p2: GridCoordinate) {
    return Math.abs(p1.row - p2.row) + Math.abs(p1.col - p2.col);
}

export function getCoordinateBounds(points: GridCoordinate[]) {
    let minRow = Infinity;
    let minCol = Infinity;
    let maxRow = -Infinity;
    let maxCol = -Infinity;
    for (const { row, col } of points) {
        minRow = Math.min(minRow, row);
        minCol = Math.min(minCol, col);
        maxRow = Math.max(maxRow, row);
        maxCol = Math.max(maxCol, col);
    }
    return { minRow, minCol, maxRow, maxCol };
}

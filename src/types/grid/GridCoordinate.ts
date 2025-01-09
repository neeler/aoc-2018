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

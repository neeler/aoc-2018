import type { GridCoordinate } from 'src/types/grid';

export function manhattanDistance(p1: GridCoordinate, p2: GridCoordinate) {
    return Math.abs(p1.row - p2.row) + Math.abs(p1.col - p2.col);
}

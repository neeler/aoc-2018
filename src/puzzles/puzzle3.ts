import { Puzzle } from './Puzzle';
import { getNumbersForEachLine } from '~/util/parsing';
import { GridCoordinate, GridCoordinateSet } from '~/types/grid';
import { MapOfArrays } from '~/util/collections';

export const puzzle3 = new Puzzle({
    day: 3,
    parseInput: (fileData) => {
        return getNumbersForEachLine(fileData).map((line) => {
            const [id, startCol, startRow, width, height] = line as [
                number,
                number,
                number,
                number,
                number,
            ];
            const positions: GridCoordinate[] = [];
            const maxRow = startRow + height;
            const maxCol = startCol + width;
            for (let row = startRow; row < maxRow; row++) {
                for (let col = startCol; col < maxCol; col++) {
                    positions.push({ row, col });
                }
            }
            return {
                id,
                positions,
                startCol,
                startRow,
                width,
                height,
            };
        });
    },
    part1: (claims) => {
        const positionsSeen = new GridCoordinateSet();
        const overlaps = new GridCoordinateSet();
        for (const { positions } of claims) {
            for (const pos of positions) {
                if (positionsSeen.has(pos)) {
                    overlaps.add(pos);
                } else {
                    positionsSeen.add(pos);
                }
            }
        }
        return overlaps.size;
    },
    part2: (claims) => {
        const positionSet = new GridCoordinateSet();
        const posToClaimMap = new MapOfArrays<string, number>();
        const safeClaims = new Set(claims.map(({ id }) => id));
        for (const { id, positions } of claims) {
            for (const position of positions) {
                const posKey = positionSet.getKey(position);
                const existingClaims = posToClaimMap.get(posKey);
                if (existingClaims?.length) {
                    safeClaims.delete(id);
                    for (const existingClaim of existingClaims) {
                        safeClaims.delete(existingClaim);
                    }
                }
                posToClaimMap.addToKey(posKey, id);
            }
        }
        if (safeClaims.size === 1) {
            return safeClaims.values().next().value;
        }
        throw new Error('No claim found');
    },
});

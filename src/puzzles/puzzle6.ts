import { Puzzle } from './Puzzle';
import { getNumbersForEachLine } from '~/util/parsing';
import {
    Grid,
    GridCoordinate,
    GridNode,
    manhattanDistance,
} from '~/types/grid';
import { maxOf } from '~/util/iterables';
import { alphanumericCharCodes } from '~/util/strings';

export const puzzle6 = new Puzzle({
    day: 6,
    parseInput: (fileData) => {
        const pointsById = new Map(
            getNumbersForEachLine(fileData).map(([col, row], index) => {
                return [
                    String.fromCharCode(alphanumericCharCodes[index]!),
                    { row, col } as GridCoordinate,
                ];
            }),
        );
        let maxRow = -Infinity;
        let maxCol = -Infinity;
        for (const point of pointsById.values()) {
            maxRow = Math.max(maxRow, point.row);
            maxCol = Math.max(maxCol, point.col);
        }
        const countsByIndex = new Map<string, number>();
        const grid = new Grid({
            width: maxCol + 1,
            height: maxRow + 1,
            defaultValue: () => '.',
            drawFn: (node) => node.data,
        });
        const totalDistanceByNode = new Map<GridNode<string>, number>();
        grid.forEach((node) => {
            let minDistance = Infinity;
            let pointsWithMinDistance: string[] = [];
            let distanceSum = 0;
            for (const [id, point] of pointsById.entries()) {
                const distance = manhattanDistance(point, node);
                distanceSum += distance;
                if (distance < minDistance) {
                    minDistance = distance;
                    pointsWithMinDistance = [id];
                } else if (distance === minDistance) {
                    pointsWithMinDistance.push(id);
                }
            }
            totalDistanceByNode.set(node, distanceSum);
            if (pointsWithMinDistance.length === 1) {
                const pointId = pointsWithMinDistance[0]!;
                node.data = pointId;
                countsByIndex.set(
                    pointId,
                    (countsByIndex.get(pointId) ?? 0) + 1,
                );
            } else {
                node.data = '.';
            }
        });
        const edgePoints = new Set<string>();
        const innerPoints = new Set(pointsById.keys());
        [
            grid.getRow(0)!,
            grid.getRow(grid.height - 1)!,
            grid.getColumn(0)!,
            grid.getColumn(grid.width - 1)!,
        ].forEach((nodes) => {
            nodes.forEach((node) => {
                if (pointsById.has(node.data)) {
                    edgePoints.add(node.data);
                    innerPoints.delete(node.data);
                    countsByIndex.delete(node.data);
                }
            });
        });
        return {
            grid,
            pointsByIndex: pointsById,
            edgePoints,
            innerPoints,
            countsByIndex,
            totalDistanceByNode,
        };
    },
    part1: ({ countsByIndex }) => {
        return maxOf(countsByIndex.values(), (v) => v);
    },
    part2: ({ grid, totalDistanceByNode }, { example }) => {
        const threshold = example ? 32 : 10000;
        return grid.filter((node) => totalDistanceByNode.get(node)! < threshold)
            .length;
    },
});
